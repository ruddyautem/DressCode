import { test, expect, mock, beforeEach } from 'bun:test';
let user, session, createdSessions, orders, creates, legacy;
mock.module('server-only',()=>({}));
mock.module('@clerk/nextjs/server',()=>({currentUser:async()=>user}));
mock.module('@/lib/env',()=>({env:{NEXT_PUBLIC_BASE_URL:'https://shop.example.test'}}));
mock.module('@/lib/imageUrl',()=>({imageUrl:()=> 'https://assets.example.test/fixture.jpg'}));
const catalog=[{_id:'dress',name:'Robe',price:80,stock:5,categorySlugs:[]}];
const client={fetch:async query=>query.includes('_type=="order"')?legacy:catalog,patch:id=>({ifRevisionId:rev=>({set:fields=>({commit:async()=>{expect(id).toBe(legacy._id);expect(rev).toBe(legacy._rev);expect(fields).not.toHaveProperty('_id');legacy={...legacy,...fields};return legacy;}})})}),createIfNotExists:async order=>{
 if(!orders.has(order._id)){orders.set(order._id,order);creates++;}return orders.get(order._id);
}};
mock.module('@/sanity/lib/client',()=>({client}));
const stripe={checkout:{sessions:{create:async input=>{createdSessions.push(input);return {id:'cs_test_fixture',url:'https://checkout.stripe.com/fixture'};},retrieve:async()=>session,listLineItems:()=>({autoPagingToArray:async()=>['S','L'].map((size,i)=>({id:'li_'+i,quantity:1,price:{unit_amount:8000,product:{name:'Robe',images:[],metadata:{sanityProductId:'dress',size}}}}))})}}};
mock.module('@/lib/stripe',()=>({default:stripe}));
const {persistPaidOrder}=await import('./orders');
const {createCheckoutSession,syncOrderFromSession}=await import('../../actions/createCheckoutSession');
beforeEach(()=>{
 user={id:'owner',fullName:'Fixture',primaryEmailAddress:{emailAddress:'fixture@example.test'}};createdSessions=[];orders=new Map();creates=0;legacy=null;
 session={id:'cs_test_fixture',payment_status:'paid',status:'complete',created:1700000000,currency:'eur',amount_total:16000,metadata:{clerkUserId:'owner',orderNumber:'server-order',customerName:'Fixture',customerEmail:'fixture@example.test'}};
});
test('a historical order with a random document ID is reused instead of duplicated',async()=>{
 legacy={_id:'legacy-random-id',_rev:'fixture',clerkUserId:'owner',orderNumber:'old-order',status:'shipped'};
 const result=await syncOrderFromSession(session.id);
 expect(result.success).toBe(true);expect(result.orderId).toBe('legacy-random-id');expect(creates).toBe(0);
});
test('a paid asynchronous payment promotes a historical pending order with a revision guard',async()=>{
 legacy={_id:'legacy-pending',_rev:'revision1',clerkUserId:'owner',orderNumber:'old-order',status:'pending'};
 const result=await syncOrderFromSession(session.id);
 expect(result.success).toBe(true);expect(legacy.status).toBe('paid');expect(creates).toBe(0);
});
test('the action ignores forged prices and identities and rejects anonymous checkout',async()=>{
 const items=[{product:{_id:'dress',price:0.01},quantity:1,size:'S'}];
 await createCheckoutSession(items,{clerkUserId:'victim',customerEmail:'forged@example.test',orderNumber:'forged'});
 expect(createdSessions[0].line_items[0].price_data.unit_amount).toBe(8000);
 expect(createdSessions[0].metadata.clerkUserId).toBe('owner');expect(createdSessions[0].metadata.orderNumber).not.toBe('forged');
 user=null;await expect(createCheckoutSession(items,{})).rejects.toThrow();expect(createdSessions).toHaveLength(1);
});
test('unpaid and foreign sessions cannot confirm or consume the basket',async()=>{
 session.payment_status='unpaid';expect((await syncOrderFromSession(session.id)).success).toBe(false);
 session.payment_status='paid';session.metadata.clerkUserId='other';expect((await syncOrderFromSession(session.id)).success).toBe(false);expect(creates).toBe(0);
});
test('webhook and return synchronization share one atomic order including both sizes and purchase prices',async()=>{
 await Promise.all([persistPaidOrder(session),syncOrderFromSession(session.id)]);
 expect(creates).toBe(1);const order=orders.get('order.cs_test_fixture');
 expect(order.products.map(p=>p.size)).toEqual(['S','L']);expect(order.products.map(p=>p.unitPrice)).toEqual([80,80]);
 const result=await syncOrderFromSession(session.id);expect(result.purchased).toEqual([{productId:'dress',size:'S',quantity:1},{productId:'dress',size:'L',quantity:1}]);
});
