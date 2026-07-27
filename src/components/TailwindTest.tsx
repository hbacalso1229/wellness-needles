// Test component to verify Tailwind CSS is working
export default function TailwindTest() {
  return (
    <div className="bg-primary text-cream p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-2">Tailwind CSS Test</h2>
      <p className="text-sm">If you can see this styled correctly, Tailwind is working!</p>
      <div className="mt-4 p-2 bg-gold text-primary rounded">
        Custom colors are working!
      </div>
    </div>
  );
}
