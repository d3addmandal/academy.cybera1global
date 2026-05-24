"use client";
import { Send } from "lucide-react";

export default function NewsletterForm() {
  return (
    <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder="Enter your email"
        className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2.5 rounded-lg placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors min-w-0"
      />
      <button
        type="submit"
        className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-500 transition-colors flex-shrink-0"
      >
        <Send className="w-4 h-4 text-white" />
      </button>
    </form>
  );
}
