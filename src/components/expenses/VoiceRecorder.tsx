import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  categoriesContext: string;
  onResult: (result: any) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ categoriesContext, onResult, disabled }: VoiceRecorderProps) {
  const { currentUser } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = processAudio;

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone', err);
      toast.error('اجازه دسترسی به میکروفون داده نشده است.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null; // Prevent processing
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      chunksRef.current = [];
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const processAudio = async () => {
    if (chunksRef.current.length === 0 || !currentUser) return;

    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'expense-audio.webm');
    formData.append('categories', categoriesContext);

    try {
      setIsProcessing(true);
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/ai/extract-expense', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const result = await response.json();
      onResult(result);
      toast.success('صدا با موفقیت پردازش شد. لطفاً اطلاعات را بررسی کنید.');
    } catch (err) {
      console.error('Error processing audio', err);
      toast.error('پردازش صدا انجام نشد. دوباره تلاش کنید.');
    } finally {
      setIsProcessing(false);
      chunksRef.current = [];
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg border border-dashed border-primary/50 text-primary">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        <span>در حال پردازش صدا با هوش مصنوعی...</span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/50">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <div className="w-3 h-3 bg-red-600 dark:bg-red-400 rounded-full animate-pulse mr-3 ml-1" />
          <span className="font-medium">در حال ضبط...</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={cancelRecording} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
          <Button variant="destructive" size="sm" onClick={stopRecording} className="gap-1">
            <Square className="w-4 h-4" />
            توقف
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/10 h-12"
      onClick={startRecording}
      disabled={disabled}
    >
      <Mic className="w-5 h-5" />
      ثبت با صدا
    </Button>
  );
}