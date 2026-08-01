from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.chat import Conversation, Message, MessageSource

class ChatRepository:
    """Repository handling CRUD operations for Conversations, Messages, and Citations."""

    @staticmethod
    def get_conversation(db: Session, conv_id: int, user_id: int) -> Conversation | None:
        """Retrieves a conversation thread checking ownership."""
        return db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == user_id).first()

    @staticmethod
    def list_conversations(db: Session, user_id: int) -> list[Conversation]:
        """Lists conversations for a user, ordered by most recently updated."""
        return db.query(Conversation).filter(Conversation.user_id == user_id).order_by(Conversation.updated_at.desc()).all()

    @staticmethod
    def create_conversation(db: Session, user_id: int, title: str) -> Conversation:
        """Initializes a new conversation thread."""
        db_conv = Conversation(user_id=user_id, title=title)
        db.add(db_conv)
        db.commit()
        db.refresh(db_conv)
        return db_conv

    @staticmethod
    def rename_conversation(db: Session, conv_id: int, user_id: int, title: str) -> Conversation | None:
        """Updates the conversation display title."""
        db_conv = ChatRepository.get_conversation(db, conv_id, user_id)
        if db_conv:
            db_conv.title = title
            db_conv.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(db_conv)
        return db_conv

    @staticmethod
    def delete_conversation(db: Session, conv_id: int, user_id: int) -> bool:
        """Purges conversation. Cascades automatically delete messages and sources."""
        db_conv = ChatRepository.get_conversation(db, conv_id, user_id)
        if db_conv:
            db.delete(db_conv)
            db.commit()
            return True
        return False

    @staticmethod
    def create_message(
        db: Session, 
        conv_id: int, 
        role: str, 
        content: str, 
        model_name: str | None = None
    ) -> Message:
        """Logs a dialog entry (user or assistant) in a conversation."""
        db_msg = Message(
            conversation_id=conv_id,
            role=role.lower(),
            content=content,
            model_name=model_name
        )
        db.add(db_msg)
        
        # Touch the parent conversation timestamp
        db_conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if db_conv:
            db_conv.updated_at = datetime.now(timezone.utc)
            
        db.commit()
        db.refresh(db_msg)
        return db_msg

    @staticmethod
    def list_messages(db: Session, conv_id: int) -> list[Message]:
        """Lists all messages inside a thread sequentially."""
        return db.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.created_at.asc()).all()

    @staticmethod
    def create_message_source(
        db: Session,
        message_id: int,
        document_id: int | None,
        chunk_id: int | None,
        page_number: int | None,
        relevance_score: float | None,
        supporting_excerpt: str
    ) -> MessageSource:
        """Saves citation reference linkage mapping answers back to document segments."""
        db_source = MessageSource(
            message_id=message_id,
            document_id=document_id,
            chunk_id=chunk_id,
            page_number=page_number,
            relevance_score=relevance_score,
            supporting_excerpt=supporting_excerpt
        )
        db.add(db_source)
        db.commit()
        db.refresh(db_source)
        return db_source
