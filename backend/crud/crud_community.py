from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from datetime import timedelta
from models.community import Post, Comment, PostLike, PostScrap
from models.user import User
from schemas.community import PostCreate, CommentCreate

def get_post_options():
    return [
        joinedload(Post.author).joinedload(User.university), # 작성자 & 학교 정보만 로딩
    ]


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


def get_best_posts(db: Session, skip: int = 0, limit: int = 5):
    # 최근 7일 게시글만 대상으로 함
    candidates = db.query(Post)\
        .options(*get_post_options())\
        .filter(Post.created_at >= func.now() - timedelta(days=7))\
        .all()

    # 기존: len(post.liked_by) -> 매번 쿼리 날라감 (느림)
    # 변경: post.like_count  -> 이미 숫자라 0초 걸림 (빠름)
    def calculate_score(post):
        return post.view_count + (post.like_count * 3) + (post.comment_count * 5)

    sorted_posts = sorted(candidates, key=calculate_score, reverse=True)
    return sorted_posts[skip : skip + limit]


def get_posts(db: Session, skip: int = 0, limit: int = 10, category: str = None):
    query = db.query(Post).options(*get_post_options())
    
    if category and category != "ALL":
        query = query.filter(Post.category == category)
        
    # 최신순 정렬
    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()


def get_post(db: Session, post_id: int):
    post = db.query(Post)\
        .options(*get_post_options())\
        .filter(Post.id == post_id).first()
    
    if post:
        post.view_count += 1
        db.commit()
        db.refresh(post)
        
    return post


def create_comment(db: Session, comment: CommentCreate, user_id: int):

    db_comment = Comment(
        content=comment.content,
        post_id=comment.post_id,
        parent_id=comment.parent_id, 
        author_id=user_id
    )
    db.add(db_comment)

    post = db.query(Post).filter(Post.id == comment.post_id).first()
    if post:
        post.comment_count += 1
        
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_comments_by_post(db: Session, post_id: int, skip: int = 0, limit: int = 50):
    return db.query(Comment)\
        .options(joinedload(Comment.author))\
        .filter(Comment.post_id == post_id)\
        .order_by(Comment.created_at.asc())\
        .offset(skip).limit(limit).all()

def toggle_like(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None

    # 이미 좋아요 눌렀는지 확인
    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id, 
        PostLike.user_id == user_id
    ).first()
    
    if existing_like:
        # 취소 (DELETE)
        db.delete(existing_like)
        post.like_count -= 1 # 카운트 감소
        action = "unliked"
    else:
        # 추가 (INSERT)
        new_like = PostLike(post_id=post_id, user_id=user_id)
        db.add(new_like)
        post.like_count += 1 # 카운트 증가
        action = "liked"
        
    db.commit()
    return {"action": action, "count": post.like_count}

def toggle_scrap(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
        
    existing_scrap = db.query(PostScrap).filter(
        PostScrap.post_id == post_id,
        PostScrap.user_id == user_id
    ).first()
    
    if existing_scrap:
        db.delete(existing_scrap)
        post.scrap_count -= 1
        action = "unscrapped"
    else:
        new_scrap = PostScrap(post_id=post_id, user_id=user_id)
        db.add(new_scrap)
        post.scrap_count += 1
        action = "scrapped"
        
    db.commit()
    return {"action": action, "count": post.scrap_count}


def get_my_posts(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    return db.query(Post)\
        .options(*get_post_options())\
        .filter(Post.author_id == user_id)\
        .order_by(Post.created_at.desc())\
        .offset(skip).limit(limit).all()


def get_my_scraps(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    return db.query(Post)\
        .join(PostScrap, Post.id == PostScrap.post_id)\
        .options(*get_post_options())\
        .filter(PostScrap.user_id == user_id)\
        .order_by(PostScrap.user_id.desc()) \
        .offset(skip).limit(limit).all() 