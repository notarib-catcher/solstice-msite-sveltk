import { redirect } from '@sveltejs/kit';
import * as dotenv from 'dotenv' ;
dotenv.config()

import { MongoClient } from 'mongodb';

const cstring = process.env.MONGO_URL


// @ts-ignore
const client = new MongoClient(cstring);
const database = client.db(process.env.MONGO_DB_NAME);
const passes = database.collection('passes')
const payments = database.collection('payments')
const projection = {
  _id: 0, type: 1
}

const options = {
  projection: projection
}

export const load =  async (/** @type {{ locals: { getSession: () => any; }; }} */ event) => {
    const session = await event.locals.getSession();
      if (!session?.user) {
        throw redirect(302,"/")
      }
  
      const query = { email: {$eq: session.user.email}, generated: { $eq: true } }
      const querypayments = { email: {$eq: session.user.email}, status: { $eq: "created"} }
  
      const cursor = await passes.find(query, options)
      const existingPayment = await payments.findOne(querypayments)
  
      if(!existingPayment){
        // @ts-ignore
        throw redirect(302,"/book")
      }
  
  
      return {amount: existingPayment.amount}
      
    
  };