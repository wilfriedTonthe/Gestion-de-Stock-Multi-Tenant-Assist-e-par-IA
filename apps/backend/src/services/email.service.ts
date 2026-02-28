import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Initialisation lazy de Resend pour éviter l'erreur au démarrage
let resendClient: Resend | null = null;

const getResendClient = (): Resend => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY non configurée dans le fichier .env');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
  
  await resend.emails.send({
    from: fromEmail,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const sendLowStockAlert = async (
  managerEmail: string,
  productName: string,
  warehouseName: string,
  currentQuantity: number,
  threshold: number
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53e3e;">⚠️ Alerte Stock Bas</h2>
      <p>Le stock du produit suivant est en dessous du seuil minimum :</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f7fafc;">
          <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Produit</strong></td>
          <td style="padding: 12px; border: 1px solid #e2e8f0;">${productName}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Entrepôt</strong></td>
          <td style="padding: 12px; border: 1px solid #e2e8f0;">${warehouseName}</td>
        </tr>
        <tr style="background-color: #f7fafc;">
          <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Quantité actuelle</strong></td>
          <td style="padding: 12px; border: 1px solid #e2e8f0; color: #e53e3e; font-weight: bold;">${currentQuantity}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Seuil minimum</strong></td>
          <td style="padding: 12px; border: 1px solid #e2e8f0;">${threshold}</td>
        </tr>
      </table>
      <p style="color: #718096;">Veuillez procéder au réapprovisionnement dès que possible.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="color: #a0aec0; font-size: 12px;">Cet email a été envoyé automatiquement par Inventory Manager.</p>
    </div>
  `;

  await sendEmail({
    to: managerEmail,
    subject: `⚠️ Stock Bas - ${productName} dans ${warehouseName}`,
    html,
  });
};
