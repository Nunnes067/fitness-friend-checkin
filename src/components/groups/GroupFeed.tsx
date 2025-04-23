import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Calendar, 
  MessageSquare, 
  Image, 
  Send, 
  ThumbsUp, 
  User,
  Loader2,
  Activity
} from 'lucide-react';
import { 
  getGroupFeed, 
  getGroupMembers, 
  createGroupPost, 
  likeGroupPost 
} from '@/lib/supabase';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GroupFeedProps {
  groupId: string;
  userId: string;
  isCreator: boolean;
}

export function GroupFeed({ groupId, userId, isCreator }: GroupFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Fetch feed data and members
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedResponse, membersResponse] = await Promise.all([
          getGroupFeed(groupId),
          getGroupMembers(groupId)
        ]);
        
        if (feedResponse.error) throw feedResponse.error;
        if (membersResponse.error) throw membersResponse.error;
        
        setPosts(feedResponse.data || []);
        setMembers(membersResponse.data || []);
      } catch (error) {
        console.error('Error fetching group data:', error);
        toast.error('Erro ao carregar dados do grupo');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [groupId]);
  
  // Handle image upload preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('A imagem é muito grande', {
        description: 'O tamanho máximo permitido é 5MB'
      });
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle post submission
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postContent.trim() && !imageFile) {
      toast.error('Adicione um texto ou imagem para publicar');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const { data, error } = await createGroupPost({
        groupId,
        userId, 
        content: postContent,
        imageFile
      });
      
      if (error) throw error;
      
      // Add new post to state
      setPosts([data, ...posts]);
      toast.success('Post publicado com sucesso!');
      
      // Reset form
      setPostContent('');
      setImageFile(null);
      setImagePreview(null);
      
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error('Erro ao publicar post', {
        description: error.message || 'Tente novamente mais tarde'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle post like
  const handleLikePost = async (postId: string) => {
    try {
      const { data, error } = await likeGroupPost(postId, userId);
      
      if (error) throw error;
      
      // Update posts with new like data
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: data.liked 
                ? [...(post.likes || []), { user_id: userId }] 
                : (post.likes || []).filter((like: any) => like.user_id !== userId)
            }
          : post
      ));
      
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  // Check if user has liked a post
  const hasLikedPost = (post: any) => {
    return post.likes?.some((like: any) => like.user_id === userId);
  };
  
  // Format post date
  const formatPostDate = (date: string) => {
    const postDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
    
    // If less than 24 hours ago, show relative time
    if (diffInHours < 24) {
      return formatDistanceToNow(postDate, { addSuffix: true, locale: ptBR });
    }
    
    // Otherwise show the full date
    return format(postDate, "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="feed">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="members">
            <User className="h-4 w-4 mr-2" />
            Membros ({members.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="space-y-4">
          {/* Post creation form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Criar Nova Publicação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <Textarea
                  placeholder={isCreator ? "Compartilhe dicas ou mensagens com seus alunos..." : "Compartilhe sua experiência de treino..."}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={3}
                />
                
                {imagePreview && (
                  <div className="relative mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="rounded-md max-h-48 object-contain" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      &times;
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                        <Image className="h-4 w-4" />
                        <span className="text-sm">Adicionar Imagem</span>
                      </div>
                    </Label>
                    <Input 
                      id="image-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </div>
                  
                  <Button type="submit" disabled={submitting || (!postContent.trim() && !imageFile)}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Publicar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Feed posts */}
          {posts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhuma publicação ainda</h3>
                <p className="text-muted-foreground">
                  Seja o primeiro a compartilhar algo com o grupo!
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={post.user?.photo_url} />
                        <AvatarFallback>{post.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{post.user?.name || 'Usuário'}</p>
                          {post.is_creator && (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                              Personal
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatPostDate(post.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {post.content && (
                      <p className="whitespace-pre-line mb-3">{post.content}</p>
                    )}
                    
                    {post.image_url && (
                      <div className="mt-2 rounded-md overflow-hidden">
                        <img 
                          src={post.image_url} 
                          alt="Post image" 
                          className="w-full object-contain max-h-96" 
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <Button
                      variant={hasLikedPost(post) ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleLikePost(post.id)}
                      className={hasLikedPost(post) ? "bg-primary/10 text-primary hover:text-primary" : ""}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {(post.likes?.length || 0) > 0 && post.likes.length}
                    </Button>
                    
                    {/* You can add comment functionality here */}
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Membros do Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.photo_url} />
                        <AvatarFallback>{member.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Membro desde {format(new Date(member.joined_at), "d MMM yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    {member.is_creator && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                        Personal
                      </span>
                    )}
                  </div>
                ))}
                
                {members.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum membro encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
