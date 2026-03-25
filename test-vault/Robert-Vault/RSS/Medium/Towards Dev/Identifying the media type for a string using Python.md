---
title: Identifying the media type for a string using Python
link: https://towardsdev.com/identifying-the-media-type-for-a-string-using-python-7f7fddc38db0?source=rss----a648dc4ecb66---4
author: Bilal Mussa
publish_date: 2026-01-15 03:05:19
saved_date: 2026-01-17 15:09:55
image: https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=7f7fddc38db0
tags: #data-analytics #data-engineering #python #data-science
---

![image](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=7f7fddc38db0)

Now, this is not something that you need for everyday. However, there’ll be times when you need to write some code to identify the media type of a file which you may have received as a string because….. you cant send/upload images. They get converted to bytes and then to convert it back, you need to know the type.

Sounds pretty confusing? It is! But I had this problem a while ago when I needed to download a media file which I uploaded as bytes. The file type was stored as bytes which was fine, however, I wanted to display it back on a UI. Therefore, I had to download it back as bytes and use base64 to then identify the format so it could be displayed correctly.

I focussed on PNG and JPEG as these were the main ones, it is possible to extend the code to look at other formats as you just need to know the signature for the format type. Thats the bit thats wrapped in the bytes content.

The code below takes the string, cleans it up and then checks against the signatures to see what type exists. Once it matches it will return the type else it will return None.

The below is a nice little nifty way of getting round the issue for sharing media files as strings.

def is\_base64\_media(s):  
    """  
    Checks if a string is a valid Base64 encoding AND if the decoded content  
    is one of the specified media types (JPEG, PNG) by checking magic bytes.  
    This version includes the most robust cleaning of non-Base64 characters.  
  
    Args:  
        s (str): The potential Base64 string to check.  
  
    Returns:  
        str or None: The detected media type (e.g., 'jpeg', 'png') if found,  
                     or None if it's not valid Base64 or doesn't match a type.  
    """  
    if not isinstance(s, str):  
        return None  
  
    # 1. Aggressively Clean and Prepare the String  
    # Define the set of valid standard Base64 and URL-safe characters, plus padding  
    VALID\_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\_="  
  
    # Remove any non-Base64 characters, and also remove common Data URI headers  
    s\_clean = re.sub(r"^data:\[\\w/\\.-\]+;base64,", "", s.strip())  
  
    # Replace URL-safe characters with standard ones (the most common requirement)  
    s\_clean = s\_clean.replace("-", "+").replace("\_", "/")  
  
    # Filter the string to keep ONLY valid Base64 characters  
    s\_clean = "".join(c for c in s\_clean if c in VALID\_CHARS)  
  
    # Check for empty string after cleaning  
    if not s\_clean:  
        return None  
  
    # Check length and add padding characters if missing (important for b64decode)  
    missing\_padding = len(s\_clean) % 4  
    if missing\_padding != 0:  
        s\_clean += "=" \* (4 - missing\_padding)  
  
    # 2. Decode the Base64 string  
    decoded\_bytes = None  
    try:  
        encoded\_bytes = s\_clean.encode("ascii")  
        # NOTE: With the above aggressive cleaning, standard b64decode should work.  
        # The base64.b64decode will raise binascii.Error if the string is malformed  
        decoded\_bytes = base64.b64decode(encoded\_bytes)  
    except base64.binascii.Error:  
        return None  # Still failed to decode after robust cleaning  
  
    # If decoding failed or no bytes were produced  
    if not decoded\_bytes:  
        return None  
  
  
    # 3. Check Magic Bytes (File Headers)  
    JPEG\_SOI = b"\\xff\\xd8\\xff"  # Start of Image marker for JPEG  
  
    PNG\_SIGNATURE = b"\\x89PNG\\r\\n\\x1a\\n"  # PNG 8-byte header  
  
    # Check for PNG  
    # PNG signature is 8 bytes long  
    if decoded\_bytes.startswith(PNG\_SIGNATURE):  
        return "png"  
  
    # Check for JPEG/JPG (existing logic)  
    if decoded\_bytes.startswith(JPEG\_SOI):  
        return "jpeg"  
  
    return None

![](https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=7f7fddc38db0)

* * *

[Identifying the media type for a string using Python](https://towardsdev.com/identifying-the-media-type-for-a-string-using-python-7f7fddc38db0) was originally published in [Towards Dev](https://towardsdev.com) on Medium, where people are continuing the conversation by highlighting and responding to this story.