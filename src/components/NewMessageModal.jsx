// src/components/NewMessageModal.jsx
import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function NewMessageModal({ isOpen, onClose, defaultReceiverId }) {
  const [receiverId, setReceiverId] = useState(defaultReceiverId || "");
  const [content, setContent] = useState("");

  if (!isOpen) return null;

  const send = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user || !receiverId || !content.trim()) return;

    await supabase.from("messages").insert({
      sender_id: auth.user.id,
      receiver_id: receiverId,
      content,
    });

    setContent("");
    if (!defaultReceiverId) setReceiverId("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded shadow w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">New Message</h2>

        {!defaultReceiverId && (
          <input
            className="w-full p-2 border rounded"
            placeholder="Receiver User_id (UUID)"
            value={receiverId}
            onChange={e => setReceiverId(e.target.value)}
          />
        )}

        <textarea
          className="w-full p-2 border rounded"
          placeholder="Type your message..."
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded border border-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={send}
            className="px-4 py-2 rounded bg-orange-600 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
