# TikTok Content Posting API - Get Started

This guide demonstrates how to use the Content Posting API to post content directly to TikTok.

## Prerequisites

To successfully complete this tutorial, you will need the following:

### For Video Posts

1. **A valid video** if you want to post videos:
   - Ensure you have a video file in one of the supported formats, such as MP4 + H.264, stored on your local machine.
   - Alternatively, you can provide the URL of a video from your verified domain or URL prefix. Learn how to verify your domain or URL prefix.
   - Learn more about video restrictions.

### For Photo Posts

2. **A valid photo** if you want to post photos:
   - You must provide a URL of a photo from your verified domain or URL prefix. Learn how to verify your domain or URL prefix.
   - Learn more about photo restrictions.

### App Setup Requirements

3. **A registered app** on the TikTok for Developers website.
4. **Add the Content Posting API product** to your app.
5. **Enable Direct Post configuration** for the Content Posting API in your app to enable the direct posting of content on authorized users' profiles.

### Authorization Requirements

6. **Get approval and authorization** of the `video.publish` scope:
   - Your app must be approved for the `video.publish` scope.
   - The target TikTok user must have authorized your app for the `video.publish` scope.
7. **The access token and open ID** of the TikTok user who authorized your app.

> **Note:** All content posted by unaudited clients will be restricted to private viewing mode. Once you have successfully tested your integration, to lift the restrictions on content visibility, your API client must undergo an audit to verify compliance with our Terms of Service.

## Post Directly to TikTok

This section demonstrates how to successfully post a video or photo to a creator's TikTok account.

### Query Creator Info

To initiate a direct post to a creator's account, you must first use the Query Creator Info endpoint to get the target creator's latest information. For more information about why creator information is necessary, refer to the UX guidelines.

**Request:**

```bash
curl --location --request POST 'https://open.tiktokapis.com/v2/post/publish/creator_info/query/' \
--header 'Authorization: Bearer act.example12345Example12345Example' \
--header 'Content-Type: application/json; charset=UTF-8'
```

**Response:**

```json
{
  "data": {
    "creator_avatar_url": "https://lf16-tt4d.tiktokcdn.com/obj/tiktok-open-platform/8d5740ac3844be417beeacd0df75aef1",
    "creator_username": "tiktok",
    "creator_nickname": "TikTok Official",
    "privacy_level_options": [
      "PUBLIC_TO_EVERYONE",
      "MUTUAL_FOLLOW_FRIENDS",
      "SELF_ONLY"
    ],
    "comment_disabled": false,
    "duet_disabled": false,
    "stitch_disabled": true,
    "max_video_post_duration_sec": 300
  },
  "error": {
    "code": "ok",
    "message": "",
    "log_id": "202210112248442CB9319E1FB30C1073F3"
  }
}
```

### Post a Video

To initiate video upload on TikTok's server, you must invoke the Direct Post Video endpoint. You have the following two options:

- If you have the video file locally, set the `source` parameter to `FILE_UPLOAD` in your request.
- If the video is hosted on a URL, set the `source` parameter to `PULL_FROM_URL`.

#### Example using `source=FILE_UPLOAD`

**Request:**

```bash
curl --location 'https://open.tiktokapis.com/v2/post/publish/video/init/' \
--header 'Authorization: Bearer act.example12345Example12345Example' \
--header 'Content-Type: application/json; charset=UTF-8' \
--data-raw '{
  "post_info": {
    "title": "this will be a funny #cat video on your @tiktok #fyp",
    "privacy_level": "MUTUAL_FOLLOW_FRIENDS",
    "disable_duet": false,
    "disable_comment": true,
    "disable_stitch": false,
    "video_cover_timestamp_ms": 1000
  },
  "source_info": {
      "source": "FILE_UPLOAD",
      "video_size": 50000123,
      "chunk_size":  10000000,
      "total_chunk_count": 5
  }
}'
```

**Response:**

```json
{
  "data": {
    "publish_id": "v_pub_file~v2-1.123456789",
    "upload_url": "https://open-upload.tiktokapis.com/video/?upload_id=67890&upload_token=Xza123"
  },
  "error": {
    "code": "ok",
    "message": "",
    "log_id": "202210112248442CB9319E1FB30C1073F3"
  }
}
```

#### Example using `source=PULL_FROM_URL`

**Request:**

```bash
curl --location 'https://open.tiktokapis.com/v2/post/publish/video/init/' \
--header 'Authorization: Bearer act.example12345Example12345Example' \
--header 'Content-Type: application/json; charset=UTF-8' \
--data-raw '{
  "post_info": {
    "title": "this will be a funny #cat video on your @tiktok #fyp",
    "privacy_level": "MUTUAL_FOLLOW_FRIENDS",
    "disable_duet": false,
    "disable_comment": true,
    "disable_stitch": false,
    "video_cover_timestamp_ms": 1000
  },
  "source_info": {
      "source": "PULL_FROM_URL",
      "video_url": "https://example.verified.domain.com/example_video.mp4"
  }
}'
```

**Response:**

```json
{
  "data": {
    "publish_id": "v_pub_url~v2.123456789"
  },
  "error": {
    "code": "ok",
    "message": "",
    "log_id": "202210112248442CB9319E1FB30C1073F4"
  }
}
```

#### File Upload Process (for `source=FILE_UPLOAD`)

If you are using `source=FILE_UPLOAD`:

1. Extract the `upload_url` and `publish_id` from the response data.
2. Send the video from your local filesystem to the extracted `upload_url` using a PUT request. The video processing will occur asynchronously once the upload is complete.

```bash
curl --location --request PUT 'https://open-upload.tiktokapis.com/video/?upload_id=67890&upload_token=Xza123' \
--header 'Content-Range: bytes 0-30567099/30567100' \
--header 'Content-Type: video/mp4' \
--data '@/path/to/file/example.mp4'
```

#### Check Post Status

With the `publish_id` returned earlier, check for status updates using the Get Post Status endpoint:

```bash
curl --location 'https://open.tiktokapis.com/v2/post/publish/status/fetch/' \
--header 'Authorization: Bearer act.example12345Example12345Example' \
--header 'Content-Type: application/json; charset=UTF-8' \
--data '{
    "publish_id": "v_pub_url~v2.123456789"
}'
```

### Post Photos

To initiate photo upload on TikTok's server, you must invoke the Content Posting API endpoint.

**Note:** There are differences between the photo post endpoint and the existing video post endpoint:

- Use `/v2/post/publish/content/init/` to upload photos instead of `/v2/post/publish/inbox/video/init/`
- The `post_mode` and `media_type` is required in request.body

#### Example Photo Post

**Request:**

```bash
curl --location 'https://open.tiktokapis.com/v2/post/publish/content/init/' \
--header 'Authorization: Bearer act.example12345Example12345Example' \
--header 'Content-Type: application/json' \
--data-raw '{
    "post_info": {
        "title": "funny cat",
        "description": "this will be a #funny photo on your @tiktok #fyp",
        "disable_comment": true,
        "privacy_level": "PUBLIC_TO_EVERYONE",
        "auto_add_music": true
    },
    "source_info": {
        "source": "PULL_FROM_URL",
        "photo_cover_index": 1,
        "photo_images": [
            "https://tiktokcdn.com/obj/example-image-01.webp",
            "https://tiktokcdn.com/obj/example-image-02.webp"
        ]
    },
    "post_mode": "DIRECT_POST",
    "media_type": "PHOTO"
}'
```

**Response:**

```json
{
  "data": {
    "publish_id": "p_pub_url~v2.123456789"
  },
  "error": {
    "code": "ok",
    "message": "",
    "log_id": "202210112248442CB9319E1FB30C1073F3"
  }
}
```

## API Endpoints Summary

| Endpoint                               | Purpose                   | Method |
| -------------------------------------- | ------------------------- | ------ |
| `/v2/post/publish/creator_info/query/` | Query creator information | POST   |
| `/v2/post/publish/video/init/`         | Initialize video upload   | POST   |
| `/v2/post/publish/content/init/`       | Initialize photo upload   | POST   |
| `/v2/post/publish/status/fetch/`       | Check post status         | POST   |

## Key Parameters

### Video Post Parameters

- **source**: `FILE_UPLOAD` or `PULL_FROM_URL`
- **privacy_level**: `PUBLIC_TO_EVERYONE`, `MUTUAL_FOLLOW_FRIENDS`, or `SELF_ONLY`
- **disable_duet**: boolean
- **disable_comment**: boolean
- **disable_stitch**: boolean
- **video_cover_timestamp_ms**: integer (for thumbnail timing)

### Photo Post Parameters

- **post_mode**: `DIRECT_POST` (required)
- **media_type**: `PHOTO` (required)
- **auto_add_music**: boolean
- **photo_cover_index**: integer (index of cover photo)
- **photo_images**: array of image URLs

---

_Source: [TikTok for Developers - Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started)_
