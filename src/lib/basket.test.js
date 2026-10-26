import { test, expect, afterAll } from 'bun:test';
const originalWindow=globalThis.window;
const saved = new Map();
globalThis.localStorage = {getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)};
globalThis.window={localStorage:globalThis.localStorage};
afterAll(()=>{globalThis.window=originalWindow;});
const {default:useBasketStore}=await import('../app/(store)/store');
test('only a pending checkout from this browser consumes paid sizes, once, preserving extra items',()=>{
 const items=[{product:{_id:'dress'},size:'S',quantity:3},{product:{_id:'dress'},size:'L',quantity:1},{product:{_id:'coat'},size:'M',quantity:2}];
 useBasketStore.setState({items,processedSessions:[],pendingCheckoutIds:[]});
 const purchased=[{productId:'dress',size:'S',quantity:2}];
 useBasketStore.getState().consumePaidSession('cs_test_old',purchased);expect(useBasketStore.getState().items).toEqual(items);
 useBasketStore.getState().rememberCheckout('cs_test_current');
 useBasketStore.getState().consumePaidSession('cs_test_current',purchased);
 expect(useBasketStore.getState().items.map(i=>i.quantity)).toEqual([1,1,2]);
 useBasketStore.getState().consumePaidSession('cs_test_current',purchased);
 expect(useBasketStore.getState().items.map(i=>i.quantity)).toEqual([1,1,2]);
});
