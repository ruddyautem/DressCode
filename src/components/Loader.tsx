const Loader = () => {
  return (
    <div className='min-h-[50vh] flex flex-col justify-center items-center gap-4'>
      <div className='relative w-12 h-12 flex items-center justify-center'>
        <div className='absolute inset-0 rounded-full border-2 border-slate-200 animate-ping opacity-25' />
        <div className='w-10 h-10 rounded-full border-2 border-slate-900 border-t-transparent animate-spin' />
      </div>
      <span className='text-xs font-semibold tracking-widest text-slate-400 uppercase animate-pulse'>
        DressCode
      </span>
    </div>
  );
};

export default Loader;

