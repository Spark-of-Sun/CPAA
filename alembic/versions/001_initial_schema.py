"""Initial schema

Revision ID: 001
Revises: 
Create Date: 2025-01-01

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(255), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=True),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('picture', sa.Text(), nullable=True),
        sa.Column('whatsapp_number', sa.String(20), unique=True, nullable=True),
        sa.Column('whatsapp_linked_at', sa.DateTime(), nullable=True),
        sa.Column('preferences', sa.JSON(), default=dict),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('last_active_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
    )
    
    # Tool connections table
    op.create_table(
        'tool_connections',
        sa.Column('id', sa.String(255), primary_key=True),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('toolkit', sa.String(100), nullable=False),
        sa.Column('auth_config_id', sa.String(255), nullable=True),
        sa.Column('status', sa.String(50), default='active'),
        sa.Column('scopes', sa.JSON(), default=list),
        sa.Column('connected_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('last_used_at', sa.DateTime(), nullable=True),
    )
    
    # Agent sessions table
    op.create_table(
        'agent_sessions',
        sa.Column('id', sa.String(255), primary_key=True),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('session_type', sa.String(50), default='whatsapp'),
        sa.Column('mcp_config_id', sa.String(255), nullable=True),
        sa.Column('message_count', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('last_activity_at', sa.DateTime(), default=sa.func.now()),
    )
    
    # WhatsApp linking OTPs table
    op.create_table(
        'whatsapp_linking_otps',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('code', sa.String(10), unique=True, nullable=False),
        sa.Column('flow', sa.String(50), nullable=False),
        sa.Column('auth0_user_id', sa.String(255), nullable=True),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('used', sa.Boolean(), default=False),
        sa.Column('used_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
    )
    
    # MCP configs table
    op.create_table(
        'mcp_configs',
        sa.Column('id', sa.String(255), primary_key=True),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('toolkits', sa.JSON(), default=list),
        sa.Column('allowed_tools', sa.JSON(), default=list),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Indexes
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_whatsapp', 'users', ['whatsapp_number'])
    op.create_index('ix_tool_connections_user', 'tool_connections', ['user_id'])
    op.create_index('ix_agent_sessions_user', 'agent_sessions', ['user_id'])
    op.create_index('ix_otp_code', 'whatsapp_linking_otps', ['code'])
    op.create_index('ix_mcp_configs_user', 'mcp_configs', ['user_id'])


def downgrade() -> None:
    op.drop_table('mcp_configs')
    op.drop_table('whatsapp_linking_otps')
    op.drop_table('agent_sessions')
    op.drop_table('tool_connections')
    op.drop_table('users')
