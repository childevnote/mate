"""add media_urls to posts

Revision ID: a1b2c3d4e5f6
Revises: cf6026896bcd
Create Date: 2026-03-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'cf6026896bcd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('posts', sa.Column('media_urls', JSONB(), server_default='[]', nullable=True))


def downgrade() -> None:
    op.drop_column('posts', 'media_urls')
