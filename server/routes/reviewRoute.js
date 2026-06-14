import express from 'express';
import {
    postReview,
    getReviews,
    putReview,
    deleteReview,
    voteHelpful,
} from '../controller/ReviewController.js';

import { authenticateToken, authorizeOwnership } from '../middleWare/authMiddleware.js';
import { getReviewById } from '../models/ReviewModel.js';

const router = express.Router({ mergeParams: true });

router.get('/', getReviews);

router.post('/', authenticateToken, postReview);

router.put('/:reviewId',
    authenticateToken,
    authorizeOwnership({
        getById: getReviewById,
        paramName: 'reviewId',
        ownerField: 'user_id'
    }),
    putReview
);

router.delete('/:reviewId',
    authenticateToken,
    authorizeOwnership({
        getById: getReviewById,
        paramName: 'reviewId',
        ownerField: 'user_id'
    }),
    deleteReview
);

// POST /places/:placeId/reviews/:reviewId/helpful
// body: { vote: 'up' | 'down' | null }
router.post('/:reviewId/helpful', authenticateToken, voteHelpful);

export default router;