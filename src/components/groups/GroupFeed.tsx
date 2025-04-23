
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ThumbsUp, Clock, Image, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getGroupFeed, 
  getGroupMembers, 
  createGroupPost, 
  likeGroupPost 
} from '@/lib/supabase/groups'; // Direct import from the groups module

interface GroupFeedProps {
  groupId: string;
  userId: string;
}

export default function GroupFeed({ groupId, userId }: GroupFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch group feed posts
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getGroupFeed(groupId);
      
      if (error) {
        console.error('Error fetching group feed:', error);
        toast.error('Erro ao carregar publicações do grupo');
        return;
      }
      
      setPosts(data || []);
    } catch (err) {
      console.error('Unexpected error fetching group feed:', err);
      toast.error('Ocorreu um erro ao carregar as publicações');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchPosts();
    }
  }, [groupId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !imageFile) {
      toast.error('Adicione um texto ou imagem para publicar');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await createGroupPost({
        groupId,
        userId,
        content: content.trim(),
        imageFile,
      });
      
      if (error) {
        console.error('Error creating post:', error);
        toast.error('Erro ao criar publicação');
        return;
      }
      
      toast.success('Publicação criada com sucesso!');
      setContent('');
      handleRemoveImage();
      fetchPosts();
    } catch (err) {
      console.error('Unexpected error creating post:', err);
      toast.error('Ocorreu um erro ao criar a publicação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const { data, error } = await likeGroupPost(postId, userId);
      
      if (error) {
        console.error('Error liking post:', error);
        toast.error('Erro ao reagir à publicação');
        return;
      }
      
      fetchPosts();
    } catch (err) {
      console.error('Unexpected error liking post:', err);
      toast.error('Ocorreu um erro ao reagir à publicação');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Compartilhe algo com o grupo..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-60 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
            >
              Remover
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <Button type="button" variant="outline" size="sm" className="mr-2" asChild>
              <label>
                <Image className="mr-1" />
                Adicionar Imagem
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </Button>
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              'Publicar'
            )}
          </Button>
        </div>
      </form>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AnimatePresence>
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <Avatar>
                        <AvatarImage src={post.user?.photo_url} />
                        <AvatarFallback>
                          {post.user?.name?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{post.user?.name || "Usuário"}</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(post.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-2">
                      {post.content && (
                        <p className="whitespace-pre-wrap mb-4">{post.content}</p>
                      )}
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt="Imagem da publicação"
                          className="w-full h-auto rounded-md max-h-80 object-cover"
                        />
                      )}
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="gap-1"
                        onClick={() => handleLikePost(post.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Curtir
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center mb-4">
                  Nenhuma publicação ainda. Seja o primeiro a compartilhar algo com o grupo!
                </p>
              </CardContent>
            </Card>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
