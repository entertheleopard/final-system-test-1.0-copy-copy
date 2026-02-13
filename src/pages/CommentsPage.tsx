import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart, Reply, MoreVertical } from 'lucide-react';

export default function CommentsPage() {
  const comments: any[] = [];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-h1 font-medium text-foreground mb-2">Comments</h1>
          <p className="text-body text-tertiary-foreground">
            Engage with the community and respond to feedback
          </p>
        </header>

        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="border border-border shadow-md hover:shadow-lg transition-all duration-normal">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Post Thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={comment.postImage}
                      alt={comment.postTitle}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-body-sm font-medium text-foreground">
                            {comment.author}
                          </p>
                          <p className="text-caption text-tertiary-foreground">
                            on {comment.postTitle}
                          </p>
                        </div>
                      </div>
                      <button className="text-tertiary-foreground hover:text-foreground transition-colors duration-normal">
                        <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    </div>

                    <p className="text-body text-foreground mb-3">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4 text-body-sm text-tertiary-foreground">
                      <span className="text-caption">{comment.timestamp}</span>
                      <button className="flex items-center gap-1 hover:text-error transition-colors duration-normal">
                        <Heart className="w-4 h-4" strokeWidth={1.5} />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors duration-normal">
                        <Reply className="w-4 h-4" strokeWidth={1.5} />
                        <span>Reply</span>
                      </button>
                      {comment.replies > 0 && (
                        <button className="flex items-center gap-1 hover:text-primary transition-colors duration-normal">
                          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                          <span>{comment.replies} replies</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="h-12 px-8 border-border hover:bg-secondary"
          >
            Load More Comments
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
