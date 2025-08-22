import React, { useState } from 'react';
import { Message } from '@/contexts/ChatContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ImageModal } from './ImageModal';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isUser = message.role === 'user';
  const bubbleClass = isUser ? 'chat-bubble-user' : 'chat-bubble-assistant';

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const renderAttachments = () => {
    if (!message.imageUrl) return null;

    return (
      <div className="mt-2 space-y-2">
        <div className="relative group">
          <img
            src={message.imageUrl}
            alt="Attachment"
            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            style={{ maxHeight: '200px' }}
            onClick={() => handleImageClick(message.imageUrl!)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors cursor-pointer" />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`mb-4 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <div className={bubbleClass}>
          {message.text && (
            isUser ? (
              <div className="text-[color:var(--ink)]">{message.text}</div>
            ) : (
              <MarkdownRenderer content={message.text} />
            )
          )}
          {renderAttachments()}
        </div>
      </div>
      
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage}
        />
      )}
    </>
  );
};