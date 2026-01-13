from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from datetime import timedelta
from models.community import Post, Comment, PostLike, PostScrap
from models.user import User
from schemas.community import PostCreate, CommentCreate

# ---------------------------------------------------------
# 공통 옵션
# ---------------------------------------------------------
def get_post_options():
    return [
        joinedload(Post.author).joinedload(User.university),
    ]

# ---------------------------------------------------------
# 게시글 작성
# ---------------------------------------------------------
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

# ---------------------------------------------------------
# [롤백됨] 인기 게시글 조회 (좋아요 확인 로직 제거)
# ---------------------------------------------------------
def get_best_posts(db: Session, skip: int = 0, limit: int = 5):
    # 1. 후보군 조회
    candidates = db.query(Post)\
        .options(*get_post_options())\
        .filter(Post.created_at >= func.now() - timedelta(days=7))\
        .all()

    # 2. 점수 계산
    def calculate_score(post):
        return post.view_count + (post.like_count * 3) + (post.comment_count * 5)

    # 3. 정렬 및 페이징
    sorted_posts = sorted(candidates, key=calculate_score, reverse=True)
    final_posts = sorted_posts[skip : skip + limit]
    
    # 4. 목록에서는 is_liked 여부를 확인하지 않음 (기본값 False)
    # Pydantic 스키마에서 기본값이 False이므로 별도 처리가 없어도 되지만, 명시적으로 설정
    for post in final_posts:
        post.is_liked = False
        post.is_scrapped = False

    return final_posts

# ---------------------------------------------------------
# [롤백됨] 게시글 목록 조회 (좋아요 확인 로직 제거)
# user_id 인자는 라우터 에러 방지를 위해 남겨두되, 사용하지 않음(=None)
# ---------------------------------------------------------
def get_posts(db: Session, skip: int = 0, limit: int = 10, category: str = None, user_id: int | None = None):
    query = db.query(Post).options(*get_post_options())
    
    if category and category != "ALL":
        query = query.filter(Post.category == category)
        
    # 단순히 목록만 가져옴 (빠름)
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    
    # 목록에서는 내 좋아요 여부 확인 안 함
    for post in posts:
        post.is_liked = False
        post.is_scrapped = False
            
    return posts

# ---------------------------------------------------------
# [유지] 게시글 상세 조회 (여기는 꼭 확인해야 함!)
# 상세 페이지 들어왔을 때 버튼이 제대로 보여야 하므로 여기는 로직 유지
# ---------------------------------------------------------
def get_post(db: Session, post_id: int, user_id: int | None = None):
    post = db.query(Post).options(*get_post_options()).filter(Post.id == post_id).first()
    
    if not post:
        return None

    post.view_count += 1
    db.commit()
    db.refresh(post)

    # 상세 페이지에서는 내가 눌렀는지 확인
    if user_id:
        like_record = db.query(PostLike).filter(
            PostLike.post_id == post_id, 
            PostLike.user_id == user_id
        ).first()
        
        scrap_record = db.query(PostScrap).filter(
            PostScrap.post_id == post_id, 
            PostScrap.user_id == user_id
        ).first()
        
        post.is_liked = True if like_record else False
        post.is_scrapped = True if scrap_record else False
    else:
        post.is_liked = False
        post.is_scrapped = False
    
    return post

# ---------------------------------------------------------
# 댓글 작성
# ---------------------------------------------------------
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

# ---------------------------------------------------------
# 댓글 목록 조회
# ---------------------------------------------------------
def get_comments_by_post(db: Session, post_id: int, skip: int = 0, limit: int = 50):
    return db.query(Comment)\
        .options(joinedload(Comment.author))\
        .filter(Comment.post_id == post_id)\
        .order_by(Comment.created_at.asc())\
        .offset(skip).limit(limit).all()

# ---------------------------------------------------------
# 좋아요 토글
# ---------------------------------------------------------
def toggle_like(db: Session, post_id: int, user_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None

    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id, 
        PostLike.user_id == user_id
    ).first()
    
    if existing_like:
        db.delete(existing_like)
        post.like_count -= 1
        action = "unliked"
    else:
        new_like = PostLike(post_id=post_id, user_id=user_id)
        db.add(new_like)
        post.like_count += 1
        action = "liked"
        
    db.commit()
    return {"action": action, "count": post.like_count}

# ---------------------------------------------------------
# 스크랩 토글
# ---------------------------------------------------------
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

# ---------------------------------------------------------
# 내가 쓴 글 조회
# ---------------------------------------------------------
def get_my_posts(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    return db.query(Post)\
        .options(*get_post_options())\
        .filter(Post.author_id == user_id)\
        .order_by(Post.created_at.desc())\
        .offset(skip).limit(limit).all()

# ---------------------------------------------------------
# 내가 스크랩한 글 조회
# ---------------------------------------------------------
def get_my_scraps(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    return db.query(Post)\
        .join(PostScrap, Post.id == PostScrap.post_id)\
        .options(*get_post_options())\
        .filter(PostScrap.user_id == user_id)\
        .order_by(PostScrap.user_id.desc()) \
        .offset(skip).limit(limit).all()