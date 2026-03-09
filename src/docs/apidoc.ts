/**
 * @api {post} /api/auth/register Register
 * @apiName Register
 * @apiGroup Auth
 * @apiDescription Create a new user account and sign in immediately.
 * @apiBody {String} username Username.
 * @apiBody {String} email Email address.
 * @apiBody {String} password Password, minimum 6 characters.
 */

/**
 * @api {post} /api/auth/login Login
 * @apiName Login
 * @apiGroup Auth
 * @apiDescription Sign in and set the authentication cookie.
 * @apiBody {String} email Email address.
 * @apiBody {String} password Password.
 */

/**
 * @api {get} /api/auth/me CurrentUser
 * @apiName CurrentUser
 * @apiGroup Auth
 * @apiDescription Return the currently authenticated user from the auth cookie.
 */

/**
 * @api {post} /api/auth/logout Logout
 * @apiName Logout
 * @apiGroup Auth
 * @apiDescription Clear the authentication cookie.
 */

/**
 * @api {post} /api/upload UploadImage
 * @apiName UploadImage
 * @apiGroup Upload
 * @apiDescription Upload an image, optimize it, and create a short link.
 * @apiBody {File} file Image file.
 * @apiBody {Boolean} [isPublic=true] Public or private visibility.
 * @apiBody {Number} [expiresInDays=1] Link expiration in days: 1, 7, 14, or 30.
 * @apiBody {String} [description] Optional image description.
 */

/**
 * @api {get} /api/images ListPublicImages
 * @apiName ListPublicImages
 * @apiGroup Images
 * @apiDescription List public, non-expired images for the gallery.
 * @apiQuery {String="date","rating"} [sort=date] Sort order.
 */

/**
 * @api {get} /api/images/my ListMyImages
 * @apiName ListMyImages
 * @apiGroup Images
 * @apiDescription List the authenticated user's active uploads.
 */

/**
 * @api {get} /api/images/:code GetImageFile
 * @apiName GetImageFile
 * @apiGroup Images
 * @apiDescription Return the actual stored image file by short code.
 * @apiParam {String} code Image short code.
 */

/**
 * @api {delete} /api/images/:code DeleteImage
 * @apiName DeleteImage
 * @apiGroup Images
 * @apiDescription Delete an image if the current user owns it or has moderation rights.
 * @apiParam {String} code Image short code.
 */

/**
 * @api {get} /api/media/:code GetMediaMetadata
 * @apiName GetMediaMetadata
 * @apiGroup Media
 * @apiDescription Return metadata for the media details page.
 * @apiParam {String} code Image short code.
 */

/**
 * @api {get} /api/media/:code/comments ListComments
 * @apiName ListComments
 * @apiGroup Media
 * @apiDescription List comments for one media item.
 * @apiParam {String} code Image short code.
 */

/**
 * @api {post} /api/media/:code/comments AddComment
 * @apiName AddComment
 * @apiGroup Media
 * @apiDescription Add a comment to a media item.
 * @apiParam {String} code Image short code.
 * @apiBody {String} text Comment text.
 */

/**
 * @api {get} /api/media/:code/votes GetVotes
 * @apiName GetVotes
 * @apiGroup Media
 * @apiDescription Return upvotes, downvotes, rating, and the current user's vote.
 * @apiParam {String} code Image short code.
 */

/**
 * @api {post} /api/media/:code/vote VoteMedia
 * @apiName VoteMedia
 * @apiGroup Media
 * @apiDescription Create, update, or remove an upvote or downvote.
 * @apiParam {String} code Image short code.
 * @apiBody {String="upvote","downvote"} type Vote type.
 */

/**
 * @api {get} /api/users/me/stats GetMyStats
 * @apiName GetMyStats
 * @apiGroup Users
 * @apiDescription Return personal upload, rating, balance, and CO2 savings stats.
 */

/**
 * @api {get} /api/users/me/upload-allowance GetUploadAllowance
 * @apiName GetUploadAllowance
 * @apiGroup Users
 * @apiDescription Return monthly free upload usage and whether uploading is currently allowed.
 */

/**
 * @api {post} /api/balance/topup TopUpBalance
 * @apiName TopUpBalance
 * @apiGroup Balance
 * @apiDescription Increase the authenticated user's balance.
 * @apiBody {Number} [amountCents] Amount in cents.
 * @apiBody {Number} [amountEur] Amount in euros.
 */

/**
 * @api {get} /api/stats/environment GetEnvironmentStats
 * @apiName GetEnvironmentStats
 * @apiGroup Stats
 * @apiDescription Return total saved bytes and estimated CO2 savings across active media.
 */

export {};
