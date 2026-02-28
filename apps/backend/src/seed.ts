import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import Organization from './models/Organization.js';
import User from './models/User.js';
import Warehouse from './models/Warehouse.js';
import Product from './models/Product.js';
import Stock from './models/Stock.js';
import StockMovement from './models/StockMovement.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db';

async function seed() {
  try {
    console.log('🌱 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Clear existing data
    console.log('🗑️  Suppression des données existantes...');
    await Promise.all([
      Organization.deleteMany({}),
      User.deleteMany({}),
      Warehouse.deleteMany({}),
      Product.deleteMany({}),
      Stock.deleteMany({}),
      StockMovement.deleteMany({}),
    ]);

    // Create Organization
    console.log('🏢 Création de l\'organisation...');
    const organization = await Organization.create({
      name: 'TechStore SARL',
      slug: 'techstore-sarl',
      email: 'contact@techstore.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Avenue de la Tech, 75001 Paris',
    });

    // Create Warehouses first (needed for manager/staff warehouseId)
    console.log('🏭 Création des entrepôts...');
    const warehouses = await Warehouse.create([
      {
        organizationId: organization._id,
        name: 'Usine Principale',
        type: 'factory',
        address: '45 Zone Industrielle Nord',
        city: 'Lyon',
        country: 'France',
        managerEmail: 'manager.usine@techstore.com',
      },
      {
        organizationId: organization._id,
        name: 'Entrepôt Central',
        type: 'warehouse',
        address: '78 Rue du Commerce',
        city: 'Paris',
        country: 'France',
        managerEmail: 'manager.entrepot@techstore.com',
      },
      {
        organizationId: organization._id,
        name: 'Boutique Champs-Élysées',
        type: 'store',
        address: '156 Avenue des Champs-Élysées',
        city: 'Paris',
        country: 'France',
        managerEmail: 'manager.boutique@techstore.com',
      },
      {
        organizationId: organization._id,
        name: 'Boutique Lyon',
        type: 'store',
        address: '23 Rue de la République',
        city: 'Lyon',
        country: 'France',
        managerEmail: 'manager.lyon@techstore.com',
      },
    ]);

    // Create Super Admin (niveau plateforme - pas d'organizationId)
    console.log('👥 Création des utilisateurs...');
    
    await User.create({
      email: 'superadmin@inventory-manager.com',
      password: 'superadmin123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'superadmin',
    });

    // Admin Entreprise (voit tout dans son organisation)
    const admin = await User.create({
      organizationId: organization._id,
      email: 'admin@techstore.com',
      password: 'password123',
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'admin',
    });

    // Gestionnaires d'Entrepôt (un par entrepôt)
    const managerUsine = await User.create({
      organizationId: organization._id,
      warehouseId: warehouses[0]._id,
      email: 'manager.usine@techstore.com',
      password: 'password123',
      firstName: 'Marie',
      lastName: 'Martin',
      role: 'manager',
    });

    const managerEntrepot = await User.create({
      organizationId: organization._id,
      warehouseId: warehouses[1]._id,
      email: 'manager.entrepot@techstore.com',
      password: 'password123',
      firstName: 'Paul',
      lastName: 'Durand',
      role: 'manager',
    });

    await User.create({
      organizationId: organization._id,
      warehouseId: warehouses[2]._id,
      email: 'manager.boutique@techstore.com',
      password: 'password123',
      firstName: 'Sophie',
      lastName: 'Leroy',
      role: 'manager',
    });

    // Magasiniers / Staff (un par entrepôt)
    const staffUsine = await User.create({
      organizationId: organization._id,
      warehouseId: warehouses[0]._id,
      email: 'staff.usine@techstore.com',
      password: 'password123',
      firstName: 'Pierre',
      lastName: 'Bernard',
      role: 'staff',
    });

    await User.create({
      organizationId: organization._id,
      warehouseId: warehouses[1]._id,
      email: 'staff.entrepot@techstore.com',
      password: 'password123',
      firstName: 'Lucas',
      lastName: 'Moreau',
      role: 'staff',
    });

    await User.create({
      organizationId: organization._id,
      warehouseId: warehouses[2]._id,
      email: 'staff.boutique@techstore.com',
      password: 'password123',
      firstName: 'Emma',
      lastName: 'Petit',
      role: 'staff',
    });

    // Create Products
    console.log('📦 Création des produits...');
    const products = await Product.create([
      {
        organizationId: organization._id,
        sku: 'PHONE-001',
        name: 'Smartphone Pro Max',
        description: 'Smartphone haut de gamme avec écran OLED',
        category: 'Téléphones',
        unit: 'pcs',
        minThreshold: 20,
        price: 999.99,
      },
      {
        organizationId: organization._id,
        sku: 'PHONE-002',
        name: 'Smartphone Lite',
        description: 'Smartphone entrée de gamme',
        category: 'Téléphones',
        unit: 'pcs',
        minThreshold: 30,
        price: 299.99,
      },
      {
        organizationId: organization._id,
        sku: 'LAPTOP-001',
        name: 'Laptop Pro 15"',
        description: 'Ordinateur portable professionnel',
        category: 'Ordinateurs',
        unit: 'pcs',
        minThreshold: 10,
        price: 1499.99,
      },
      {
        organizationId: organization._id,
        sku: 'LAPTOP-002',
        name: 'Laptop Gaming 17"',
        description: 'Ordinateur portable gaming haute performance',
        category: 'Ordinateurs',
        unit: 'pcs',
        minThreshold: 5,
        price: 2199.99,
      },
      {
        organizationId: organization._id,
        sku: 'TAB-001',
        name: 'Tablette 10"',
        description: 'Tablette tactile 10 pouces',
        category: 'Tablettes',
        unit: 'pcs',
        minThreshold: 15,
        price: 449.99,
      },
      {
        organizationId: organization._id,
        sku: 'ACC-001',
        name: 'Écouteurs Bluetooth',
        description: 'Écouteurs sans fil avec réduction de bruit',
        category: 'Accessoires',
        unit: 'pcs',
        minThreshold: 50,
        price: 149.99,
      },
      {
        organizationId: organization._id,
        sku: 'ACC-002',
        name: 'Chargeur USB-C',
        description: 'Chargeur rapide 65W',
        category: 'Accessoires',
        unit: 'pcs',
        minThreshold: 100,
        price: 39.99,
      },
      {
        organizationId: organization._id,
        sku: 'ACC-003',
        name: 'Coque Protection',
        description: 'Coque de protection smartphone',
        category: 'Accessoires',
        unit: 'pcs',
        minThreshold: 200,
        price: 19.99,
      },
    ]);

    // Create Stocks
    console.log('📊 Création des stocks...');
    const stockData = [
      // Usine Principale - stocks élevés
      { productIndex: 0, warehouseIndex: 0, quantity: 150 },
      { productIndex: 1, warehouseIndex: 0, quantity: 300 },
      { productIndex: 2, warehouseIndex: 0, quantity: 80 },
      { productIndex: 3, warehouseIndex: 0, quantity: 40 },
      { productIndex: 4, warehouseIndex: 0, quantity: 120 },
      { productIndex: 5, warehouseIndex: 0, quantity: 500 },
      { productIndex: 6, warehouseIndex: 0, quantity: 800 },
      { productIndex: 7, warehouseIndex: 0, quantity: 1500 },
      
      // Entrepôt Central - stocks moyens
      { productIndex: 0, warehouseIndex: 1, quantity: 50 },
      { productIndex: 1, warehouseIndex: 1, quantity: 100 },
      { productIndex: 2, warehouseIndex: 1, quantity: 25 },
      { productIndex: 3, warehouseIndex: 1, quantity: 15 },
      { productIndex: 4, warehouseIndex: 1, quantity: 40 },
      { productIndex: 5, warehouseIndex: 1, quantity: 150 },
      { productIndex: 6, warehouseIndex: 1, quantity: 250 },
      { productIndex: 7, warehouseIndex: 1, quantity: 400 },
      
      // Boutique Champs-Élysées - quelques stocks bas pour alertes
      { productIndex: 0, warehouseIndex: 2, quantity: 8 },  // Alerte! < 20
      { productIndex: 1, warehouseIndex: 2, quantity: 15 }, // Alerte! < 30
      { productIndex: 2, warehouseIndex: 2, quantity: 5 },  // Alerte! < 10
      { productIndex: 3, warehouseIndex: 2, quantity: 3 },  // Alerte! < 5
      { productIndex: 4, warehouseIndex: 2, quantity: 12 }, // Alerte! < 15
      { productIndex: 5, warehouseIndex: 2, quantity: 25 }, // Alerte! < 50
      { productIndex: 6, warehouseIndex: 2, quantity: 60 }, // Alerte! < 100
      { productIndex: 7, warehouseIndex: 2, quantity: 80 }, // Alerte! < 200
      
      // Boutique Lyon - stocks normaux
      { productIndex: 0, warehouseIndex: 3, quantity: 25 },
      { productIndex: 1, warehouseIndex: 3, quantity: 45 },
      { productIndex: 2, warehouseIndex: 3, quantity: 12 },
      { productIndex: 4, warehouseIndex: 3, quantity: 20 },
      { productIndex: 5, warehouseIndex: 3, quantity: 60 },
      { productIndex: 6, warehouseIndex: 3, quantity: 120 },
    ];

    const stocks = await Stock.create(
      stockData.map((s) => ({
        organizationId: organization._id,
        productId: products[s.productIndex]._id,
        warehouseId: warehouses[s.warehouseIndex]._id,
        quantity: s.quantity,
        reservedQuantity: 0,
      }))
    );

    // Create Stock Movements
    console.log('📝 Création des mouvements de stock...');
    const movements = [
      // Entrées
      {
        type: 'entry',
        productIndex: 0,
        destinationWarehouseIndex: 0,
        quantity: 100,
        reason: 'Réception fournisseur',
        reference: 'PO-2024-001',
      },
      {
        type: 'entry',
        productIndex: 1,
        destinationWarehouseIndex: 0,
        quantity: 200,
        reason: 'Réception fournisseur',
        reference: 'PO-2024-002',
      },
      {
        type: 'entry',
        productIndex: 5,
        destinationWarehouseIndex: 0,
        quantity: 300,
        reason: 'Réception fournisseur',
        reference: 'PO-2024-003',
      },
      // Transferts
      {
        type: 'transfer',
        productIndex: 0,
        sourceWarehouseIndex: 0,
        destinationWarehouseIndex: 1,
        quantity: 30,
        reason: 'Réapprovisionnement entrepôt',
        reference: 'TR-2024-001',
      },
      {
        type: 'transfer',
        productIndex: 1,
        sourceWarehouseIndex: 1,
        destinationWarehouseIndex: 2,
        quantity: 15,
        reason: 'Réapprovisionnement boutique',
        reference: 'TR-2024-002',
      },
      {
        type: 'transfer',
        productIndex: 2,
        sourceWarehouseIndex: 0,
        destinationWarehouseIndex: 3,
        quantity: 10,
        reason: 'Réapprovisionnement boutique',
        reference: 'TR-2024-003',
      },
      // Sorties
      {
        type: 'exit',
        productIndex: 0,
        sourceWarehouseIndex: 2,
        quantity: 5,
        reason: 'Vente client',
        reference: 'SO-2024-001',
      },
      {
        type: 'exit',
        productIndex: 5,
        sourceWarehouseIndex: 2,
        quantity: 10,
        reason: 'Vente client',
        reference: 'SO-2024-002',
      },
      {
        type: 'exit',
        productIndex: 1,
        sourceWarehouseIndex: 3,
        quantity: 8,
        reason: 'Vente client',
        reference: 'SO-2024-003',
      },
    ];

    await StockMovement.create(
      movements.map((m) => ({
        organizationId: organization._id,
        productId: products[m.productIndex]._id,
        sourceWarehouseId: m.sourceWarehouseIndex !== undefined ? warehouses[m.sourceWarehouseIndex]._id : undefined,
        destinationWarehouseId: m.destinationWarehouseIndex !== undefined ? warehouses[m.destinationWarehouseIndex]._id : undefined,
        type: m.type,
        quantity: m.quantity,
        reason: m.reason,
        reference: m.reference,
        performedBy: m.type === 'entry' ? managerUsine._id : admin._id,
      }))
    );

    console.log('\n✅ Données de test créées avec succès!\n');
    console.log('📋 Résumé:');
    console.log(`   - 1 Organisation: ${organization.name}`);
    console.log(`   - 10 Utilisateurs (1 superadmin + 1 admin + 3 managers + 3 staff)`);
    console.log(`   - ${warehouses.length} Entrepôts`);
    console.log(`   - ${products.length} Produits`);
    console.log(`   - ${stocks.length} Entrées de stock`);
    console.log(`   - ${movements.length} Mouvements`);
    console.log('\n🔐 Comptes de connexion:');
    console.log('   ┌─────────────────────────────────────────────────────────────────┐');
    console.log('   │ SUPER ADMIN (Plateforme)                                        │');
    console.log('   │   superadmin@inventory-manager.com / superadmin123              │');
    console.log('   ├─────────────────────────────────────────────────────────────────┤');
    console.log('   │ ADMIN ENTREPRISE (TechStore)                                    │');
    console.log('   │   admin@techstore.com / password123                             │');
    console.log('   ├─────────────────────────────────────────────────────────────────┤');
    console.log('   │ MANAGERS (Gestionnaires d\'entrepôt)                             │');
    console.log('   │   manager.usine@techstore.com / password123     → Usine         │');
    console.log('   │   manager.entrepot@techstore.com / password123  → Entrepôt      │');
    console.log('   │   manager.boutique@techstore.com / password123  → Boutique      │');
    console.log('   ├─────────────────────────────────────────────────────────────────┤');
    console.log('   │ STAFF (Magasiniers)                                             │');
    console.log('   │   staff.usine@techstore.com / password123       → Usine         │');
    console.log('   │   staff.entrepot@techstore.com / password123    → Entrepôt      │');
    console.log('   │   staff.boutique@techstore.com / password123    → Boutique      │');
    console.log('   └─────────────────────────────────────────────────────────────────┘');
    console.log('\n⚠️  8 alertes de stock bas dans la Boutique Champs-Élysées');

    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

seed();
