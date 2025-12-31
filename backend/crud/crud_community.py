from sqlalchemy.orm import Session
from models.community import Post, Comment
from schemas.community import PostCreate, CommentCreate
from models.user import User

def create_post(db: Session, post: PostCreate, user_id: int):
    db_post = Post(
        title=post.title,
        content=post.content,
        category=post.category,
        image=post.image,    
        author_id=user_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_posts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Post).offset(skip).limit(limit).all()

def create_comment(db: Session, comment: CommentCreate, user_id: int):
    db_comment = Comment(
        content=comment.content,
        post_id=comment.post_id,
        parent_id=comment.parent_id, # 대댓글이면 ID 들어감
        author_id=user_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_comments_by_post(db: Session, post_id: int, skip: int = 0, limit: int = 50):
    return db.query(Comment)\
        .filter(Comment.post_id == post_id)\
        .order_by(Comment.created_at.asc())\
        .offset(skip).limit(limit).all()


# 좋아요 토글 (ON/OFF)
def toggle_like(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    
    # 현재 유저 객체 가져오기
    user = db.query(User).filter(User.id == user_id).first()
    
    # 이미 좋아요를 눌렀는지 확인 (Relationship 이용)
    if user in post.liked_by:
        post.liked_by.remove(user) # 취소
        action = "unliked"
    else:
        post.liked_by.append(user) # 추가
        action = "liked"
        
    db.commit()
    # 갱신된 좋아요 개수 반환
    return {"action": action, "count": len(post.liked_by)}

# 스크랩 토글 (ON/OFF)
def toggle_scrap(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
        
    user = db.query(User).filter(User.id == user_id).first()
    
    if user in post.scrapped_by:
        post.scrapped_by.remove(user)
        action = "unscrapped"
    else:
        post.scrapped_by.append(user)
        action = "scrapped"
        
    db.commit()
    return {"action": action}