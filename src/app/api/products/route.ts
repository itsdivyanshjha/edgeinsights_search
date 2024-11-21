import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let searchTerm = searchParams.get('category')?.trim().toLowerCase();

    if (!searchTerm) {
      return NextResponse.json({ error: 'Invalid search term' }, { status: 400 });
    }

    console.log('Search term:', searchTerm);

    const query = {
      $or: [
        { category: { $regex: searchTerm, $options: 'i' } },
        { sub_category: { $regex: searchTerm, $options: 'i' } },
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    console.log('Constructed MongoDB query:', JSON.stringify(query));

    const client: MongoClient = await clientPromise;
    // Using the correct database and collection names from MongoDB Atlas
    const db = client.db('flipkarttest');
    const collection = db.collection('edgeinsighttest');
    
    console.log('Database:', db.databaseName);
    console.log('Collection:', collection.collectionName);

    const products = await collection.find(query).limit(20).toArray();

    console.log(`Found ${products.length} products`);

    if (products.length === 0) {
      return NextResponse.json({ message: 'No products found' }, { status: 404 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}