import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface ReviewCard {
  id: string;
  difficulty: number; // 1-5
  interval: number; // days
  repetitions: number;
  efactor: number; // ease factor
  nextReview: Date;
  lastReviewed?: Date;
}

interface LessonReview {
  lessonId: string;
  quality: number; // 0-5 (0=complete blackout, 5=perfect response)
}

export const useSpacedRepetition = () => {
  const [cards, setCards] = useLocalStorage<ReviewCard[]>('review_cards', []);

  const calculateNextReview = useCallback((card: ReviewCard, quality: number): ReviewCard => {
    let { interval, repetitions, efactor } = card;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * efactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (efactor < 1.3) efactor = 1.3;

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ...card,
      interval,
      repetitions,
      efactor,
      nextReview,
      lastReviewed: new Date(),
    };
  }, []);

  const reviewLesson = useCallback((lessonReview: LessonReview) => {
    setCards(currentCards => {
      const existingCardIndex = currentCards.findIndex(c => c.id === lessonReview.lessonId);
      
      if (existingCardIndex >= 0) {
        const updatedCards = [...currentCards];
        updatedCards[existingCardIndex] = calculateNextReview(
          updatedCards[existingCardIndex],
          lessonReview.quality
        );
        return updatedCards;
      } else {
        // New card
        const newCard: ReviewCard = {
          id: lessonReview.lessonId,
          difficulty: 1,
          interval: 1,
          repetitions: 0,
          efactor: 2.5,
          nextReview: new Date(),
        };
        return [...currentCards, calculateNextReview(newCard, lessonReview.quality)];
      }
    });
  }, [setCards, calculateNextReview]);

  const getDueCards = useCallback(() => {
    const now = new Date();
    return cards.filter(card => new Date(card.nextReview) <= now);
  }, [cards]);

  const getRecommendedLessons = useCallback(() => {
    const dueCards = getDueCards();
    // Sort by priority (overdue first, then by efactor)
    return dueCards.sort((a, b) => {
      const aDaysOverdue = Math.max(0, (Date.now() - new Date(a.nextReview).getTime()) / (1000 * 60 * 60 * 24));
      const bDaysOverdue = Math.max(0, (Date.now() - new Date(b.nextReview).getTime()) / (1000 * 60 * 60 * 24));
      
      if (aDaysOverdue !== bDaysOverdue) {
        return bDaysOverdue - aDaysOverdue; // More overdue first
      }
      
      return a.efactor - b.efactor; // Lower efactor (harder) first
    });
  }, [getDueCards]);

  return {
    cards,
    reviewLesson,
    getDueCards,
    getRecommendedLessons,
  };
};