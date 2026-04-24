'use client';

export function Header() {
  return (
    <header className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 bg-white px-6">
      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>
    </header>
  );
}
