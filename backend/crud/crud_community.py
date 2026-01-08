from sqlalchemy.orm import Session, joinedload
from models.community import Post, Comment
from schemas.community import PostCreate, CommentCreate
from models.user import User
from sqlalchemy import func
from datetime import timedelta

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

def get_post_options():
    return [
        joinedload(Post.author).joinedload(User.university), # 작성자의 학교 정보까지 로딩
        joinedload(Post.comments), # 댓글 로딩
        joinedload(Post.liked_by)  # 좋아요 누른 사람 로딩
    ]

def get_best_posts(db: Session, skip: int = 0, limit: int = 5):
    # 1. 최근 7일 게시글 후보군 가져오기
    candidates = db.query(Post)\
        .options(*get_post_options())\
        .filter(Post.created_at >= func.now() - timedelta(days=7))\
        .limit(100).all()

    # 2. 점수 계산 (조회수 + 좋아요*3 + 댓글*5)
    def calculate_score(post):
        likes = len(post.liked_by) if post.liked_by else 0
        comments = len(post.comments) if post.comments else 0
        return post.view_count + (likes * 3) + (comments * 5)

    # 3. 점수 높은 순 정렬
    sorted_posts = sorted(candidates, key=calculate_score, reverse=True)
    return sorted_posts[skip : skip + limit]

def get_posts(db: Session, skip: int = 0, limit: int = 10, category: str = None):
    query = db.query(Post).options(*get_post_options())
    if category and category != "ALL":
        query = query.filter(Post.category == category)
        
    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

def create_comment(db: Session, comment: CommentCreate, user_id: int):
    db_comment = Comment(
        content=comment.content,
        post_id=comment.post_id,
        parent_id=comment.parent_id, 
        author_id=user_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

# [최적화] 댓글 작성자 정보도 미리 로딩
def get_comments_by_post(db: Session, post_id: int, skip: int = 0, limit: int = 50):
    return db.query(Comment)\
        .options(joinedload(Comment.author))\
        .filter(Comment.post_id == post_id)\
        .order_by(Comment.created_at.asc())\
        .offset(skip).limit(limit).all()

# 좋아요 토글
def toggle_like(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if user in post.liked_by:
        post.liked_by.remove(user)
        action = "unliked"
    else:
        post.liked_by.append(user) 
        action = "liked"
        
    db.commit()
    return {"action": action, "count": len(post.liked_by)}

# 스크랩 토글
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

# 내가 쓴 글 조회 (최신순 정렬 추가)
def get_my_posts(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    return db.query(Post)\
        .options(joinedload(Post.author))\
        .filter(Post.author_id == user_id)\
        .order_by(Post.created_at.desc())\
        .offset(skip).limit(limit).all()

# 내가 스크랩한 글 조회
def get_my_scraps(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    user = db.query(User)\
        .options(joinedload(User.scrapped_posts).joinedload(Post.author))\
        .filter(User.id == user_id).first()
    
    if not user:
        return []
    
    # Python 리스트 슬라이싱 (데이터 많아지면 쿼리로 바꾸는 게 좋지만 일단 유지)
    return user.scrapped_posts[::-1][skip : skip + limit]

# [최적화] 상세 조회시에도 작성자 정보 미리 로딩
def get_post(db: Session, post_id: int):
    post = db.query(Post)\
        .options(joinedload(Post.author))\
        .filter(Post.id == post_id).first()
    
    if post:
        post.view_count += 1
        db.commit()
        db.refresh(post)
        
    return post