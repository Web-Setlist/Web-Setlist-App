@echo off
setlocal enabledelayedexpansion

echo [ > posts.json
set "first=1"

for /d %%A in (*) do (
    if /i not "%%~nA"=="Json" if /i not "%%~nA"=="Pinned" (

        set "postTitle=%%~nA"
        set "base=%%~nA"

        rem ====================================================
        rem CREATE FOLDERS 
        rem ====================================================
        if not exist "%%A\Post Cover" mkdir "%%A\Post Cover"
        if not exist "%%A\Images" mkdir "%%A\Images"
        if not exist "%%A\Video Embed" mkdir "%%A\Video Embed"
        if not exist "%%A\Attachments" mkdir "%%A\Attachments"
        if not exist "%%A\Categories" mkdir "%%A\Categories"
        if not exist "%%A\Texts" mkdir "%%A\Texts"

        rem ====================================================
        rem AUTO FILES
        rem ====================================================
        echo. > "%%A\Post Cover\post cover.txt"
        echo. > "%%A\Images\images.txt"
        echo. > "%%A\Video Embed\videos post.txt"

        rem ====================================================
        rem ATTACHMENTS
        rem ====================================================
        if not exist "%%A\Attachments\attachments post.txt" type nul > "%%A\Attachments\attachments post.txt"
        if not exist "%%A\Attachments\attachments link.txt" type nul > "%%A\Attachments\attachments link.txt"
        if not exist "%%A\Attachments\attachments description.txt" type nul > "%%A\Attachments\attachments description.txt"
        if not exist "%%A\Attachments\attachments title.txt" type nul > "%%A\Attachments\attachments title.txt"
        if not exist "%%A\Attachments\attachments post title.txt" type nul > "%%A\Attachments\attachments post title.txt"
        if not exist "%%A\Attachments\attachments link title.txt" type nul > "%%A\Attachments\attachments link title.txt"

        rem ====================================================
        rem USER FILES
        rem ====================================================
        if not exist "%%A\Video Embed\videos embed.txt" echo. > "%%A\Video Embed\videos embed.txt"
        if not exist "%%A\Categories\categories.txt" echo. > "%%A\Categories\categories.txt"
        if not exist "%%A\Texts\texts.txt" echo. > "%%A\Texts\texts.txt"

        rem ====================================================
        rem REGISTER LOCAL FILES INTO AUTO TXT
        rem ====================================================

        rem COVER IMAGES
        for %%I in (
            "%%A\Post Cover\*.jpg"
            "%%A\Post Cover\*.jpeg"
            "%%A\Post Cover\*.png"
            "%%A\Post Cover\*.bmp"
            "%%A\Post Cover\*.webp"
        ) do (
            if exist %%I echo %%~nxI>>"%%A\Post Cover\post cover.txt"
        )

        rem IMAGES
        for %%I in (
            "%%A\Images\*.jpg"
            "%%A\Images\*.jpeg"
            "%%A\Images\*.png"
            "%%A\Images\*.bmp"
            "%%A\Images\*.webp"
        ) do (
            if exist %%I echo %%~nxI>>"%%A\Images\images.txt"
        )

        rem LOCAL VIDEOS
        for %%V in ("%%A\Video Embed\*.mp4") do (
            if exist %%V echo %%~nxV>>"%%A\Video Embed\videos post.txt"
        )

        rem ====================================================
        rem BUILD JSON
        rem ====================================================

        set "coverPath=!base!/Post Cover/post cover.txt"
        set "textPath=!base!/Texts/texts.txt"
        set "imagesPath=!base!/Images/images.txt"
        set "videosLocalPath=!base!/Video Embed/videos post.txt"
        set "videosEmbedPath=!base!/Video Embed/videos embed.txt"

        set "attachLocalPath=!base!/Attachments/attachments post.txt"
        set "attachLocalTitlePath=!base!/Attachments/attachments post title.txt"

        set "attachLinkPath=!base!/Attachments/attachments link.txt"
        set "attachLinkTitlePath=!base!/Attachments/attachments link title.txt"

        set "attachDescPath=!base!/Attachments/attachments description.txt"
        set "attachTitlePath=!base!/Attachments/attachments title.txt"

        set "categoriesPath=!base!/Categories/categories.txt"

        if !first! equ 0 echo , >> posts.json
        set "first=0"

        echo { >> posts.json
        echo   "title": "!postTitle!", >> posts.json
        echo   "cover": ["!coverPath!"], >> posts.json
        echo   "text": "!textPath!", >> posts.json
        echo   "images": ["!imagesPath!"], >> posts.json
        echo   "videos local": ["!videosLocalPath!"], >> posts.json
        echo   "videos embed": ["!videosEmbedPath!"], >> posts.json

        echo   "attachments local": ["!attachLocalPath!"], >> posts.json
        echo   "attachments local title": "!attachLocalTitlePath!", >> posts.json

        echo   "attachments link": ["!attachLinkPath!"], >> posts.json
        echo   "attachments link title": "!attachLinkTitlePath!", >> posts.json

        echo   "attachments description": "!attachDescPath!", >> posts.json
        echo   "attachments title": "!attachTitlePath!", >> posts.json

        echo   "categories": ["!categoriesPath!"] >> posts.json
        echo } >> posts.json
    )
)

echo ] >> posts.json

rem ====================================================
rem PINNED FOLDER (ONLY THESE TWO FILES)
rem ====================================================
if not exist "Pinned" mkdir "Pinned"
if not exist "Pinned\pinned.txt" type nul > "Pinned\pinned.txt"
if not exist "Pinned\pinned title.txt" type nul > "Pinned\pinned title.txt"
