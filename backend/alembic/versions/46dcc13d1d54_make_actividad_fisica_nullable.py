"""make actividad_fisica nullable

Revision ID: 46dcc13d1d54
Revises: ef8d4d6993c0
Create Date: 2026-09-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '46dcc13d1d54'
down_revision: Union[str, Sequence[str], None] = 'ef8d4d6993c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.alter_column('registros_bienestar', 'actividad_fisica',
               existing_type=sa.String(),
               type_=sa.String(),
               nullable=True)

def downgrade() -> None:
    op.alter_column('registros_bienestar', 'actividad_fisica',
               existing_type=sa.String(),
               type_=sa.String(),
               nullable=False)