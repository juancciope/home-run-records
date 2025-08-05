export function TestStyles() {
  return (
    <>
      {/* Tailwind test */}
      <div className="p-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Tailwind CSS Test</h1>
        <p className="text-sm opacity-90">If you can see this styled properly, Tailwind is working!</p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-blue-500 p-4 rounded">Blue</div>
          <div className="bg-green-500 p-4 rounded">Green</div>
          <div className="bg-red-500 p-4 rounded">Red</div>
        </div>
      </div>
      
      {/* Regular CSS test */}
      <div className="test-bg">
        <h1>Regular CSS Test</h1>
        <p>If you can see this styled properly, regular CSS is working!</p>
        <div className="test-grid">
          <div className="test-card">Card 1</div>
          <div className="test-card">Card 2</div>
          <div className="test-card">Card 3</div>
        </div>
      </div>
    </>
  )
}