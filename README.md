# Hearthstone Chat

Build a Production-Ready Discord-Style Communication Platform

You are an expert full-stack engineering team. Build a complete, production-ready communication platform inspired by Discord.

The goal is to reproduce the core user experience, information architecture, interaction patterns, and functionality of a modern Discord-like application, while using original branding, assets, icons, colors, and implementation. Do not copy Discord's proprietary source code, trademarks, or copyrighted assets.

The application must feel polished, fast, responsive, and production-ready on desktop, tablet, and mobile.

1. PRODUCT GOAL

Create a real-time community and communication platform where users can:

Create accounts

Manage profiles

Add friends

Send direct messages

Create group DMs

Create servers/communities

Join servers

Create text channels

Create announcement channels

Create forum channels

Create voice channels

Create stage-style channels

Join voice calls

Share screens

Use cameras

Send files

Share images/videos

React to messages

Reply to messages

Edit/delete messages

Search messages

Mention users

Mention roles

Create roles

Configure permissions

Moderate communities

Ban/kick/timeout users

Create invite links

Manage notifications

Customize appearance

Configure privacy/security

Use bots/integrations

Receive real-time notifications

The final product should be capable of supporting large communities and thousands of concurrent users.

2. TECHNOLOGY STACK

Use a modern, scalable architecture.

Frontend

Use:

React

TypeScript

Next.js or equivalent modern React framework

Tailwind CSS

Accessible component architecture

Responsive design

WebSocket client

WebRTC for voice/video

State management using Zustand, Redux Toolkit, or an equally robust solution

Backend

Use:

Node.js

TypeScript

REST API

WebSocket gateway

PostgreSQL

Redis

Object storage such as S3-compatible storage

WebRTC infrastructure

Background workers/jobs

Use a modular architecture so services can later be separated.

Recommended architecture

Client
   |
   v
API Gateway
   |
   +---- Authentication
   +---- Users
   +---- Servers
   +---- Channels
   +---- Messages
   +---- Friends
   +---- Notifications
   +---- Moderation
   +---- Files
   +---- Bots
   |
   +---- WebSocket Gateway
   |
   +---- PostgreSQL
   +---- Redis
   +---- Object Storage
   +---- Job Queue
   +---- WebRTC/Media Server


3. AUTHENTICATION

Implement complete authentication.

Features:

Email/password registration

Login

Logout

Session management

Refresh tokens

Secure password hashing

Password reset

Email verification

Change password

Optional 2FA

Recovery codes

Session/device management

Login history

Account deletion

Account disable/deactivation

Security requirements:

Never store plaintext passwords

Secure HTTP-only cookies where appropriate

CSRF protection

Rate limiting

Brute-force protection

Input validation

Authorization on every protected endpoint

Secure file uploads

Protection against XSS

Protection against SQL injection

Protection against privilege escalation

4. USER PROFILE SYSTEM

Every user should have:

Username

Display name

Avatar

Banner

Bio/about section

Custom status

Online status

Activity status

Pronouns/custom profile fields if enabled

Connected accounts

Server-specific nickname

Server-specific avatar

Roles

Presence states:

Online

Idle

Do Not Disturb

Invisible

Offline

Users should be able to customize:

Avatar

Banner

Bio

Status

Presence

Privacy settings

5. FRIEND SYSTEM

Implement:

Send friend request

Accept friend request

Decline request

Cancel request

Remove friend

Block user

Unblock user

Friend list

Pending requests

Incoming requests

Recently interacted users

Include real-time updates when friend requests are accepted or declined.

6. DIRECT MESSAGES

Implement private messaging.

Features:

One-to-one DMs

Group DMs

Message history

Real-time delivery

Typing indicators

Read/unread state

Message editing

Message deletion

Replies

Reactions

Mentions

Attachments

Images

Videos

Audio

Files

Links

Link previews

Embeds

Pinned messages

Message search

Message forwarding

Copy message link

Delete for self where applicable

Support:

Infinite message scrolling

Virtualized message lists

Pagination

Optimistic message sending

Retry failed messages

Offline/reconnection handling

7. SERVERS / COMMUNITIES

Users can create communities.

Server properties:

Name

Icon

Banner

Description

Owner

Member count

Verification level

Default notification settings

Moderation configuration

Discovery settings

System messages

Rules

Server actions:

Create

Delete

Leave

Transfer ownership

Edit

Invite users

Generate invite links

Revoke invites

8. SERVER SIDEBAR

Create a polished sidebar containing:

Home

Friends

Direct messages

Server list

Server folders

Unread indicators

Mentions

Notification badges

Server icons should support:

Active state

Hover state

Unread indicator

Mention indicator

Context menu

Drag/reordering

Folder grouping

9. CHANNEL SYSTEM

Servers must support channels.

Channel types:

Text

Messages

Threads

Reactions

Attachments

Mentions

Pins

Announcement

Publish announcements

Follow announcement channels

Cross-server announcement delivery

Forum

Posts

Tags

Search

Sorting

Threaded discussions

Voice

Join/leave

Mute

Deafen

User volume

Video

Screen sharing

Stage-style

Speaker

Listener

Moderator

Raise hand

Invite to speak

Remove speaker

Channels should support:

Name

Description/topic

Slow mode

Permissions

Category

Position

NSFW/age restrictions where legally appropriate

User limits for voice

Bitrate configuration

10. CATEGORIES

Implement channel categories.

Features:

Create category

Rename

Delete

Reorder

Collapse/expand

Category permissions

Drag channels between categories

11. ROLES

Implement a complete role system.

Role properties:

Name

Color

Icon where supported

Position

Permissions

Mentionable

Hoisted/displayed separately

Permissions should include granular controls for:

Administrator

Manage server

Manage channels

Manage roles

Manage messages

Manage members

Ban members

Kick members

Timeout members

View channels

Send messages

Embed links

Attach files

Add reactions

Use external emojis

Connect

Speak

Stream

Use video

Move members

Mute members

Deafen members

Create invites

Manage webhooks

Manage integrations

Mention everyone

Create threads

Manage threads

Use application commands

Implement hierarchical role permissions.

12. PER-CHANNEL PERMISSIONS

Each channel should support permission overrides.

Permission resolution:

Server-wide permissions

Role permissions

Channel overrides

User-specific overrides

Administrator bypass

Provide a visual permission editor.

13. MESSAGING EXPERIENCE

The messaging interface should be highly polished.

Implement:

Message grouping

Timestamp display

Hover actions

Reactions

Reply

Edit

Delete

Pin

Copy link

Forward

Report

Context menu

Markdown

Code blocks

Syntax highlighting

Spoilers

Quotes

Lists

Headings

Mentions

Emoji

Custom emoji

Stickers

GIF support

Link previews

Rich embeds

Composer:

Auto-growing input

Emoji picker

GIF picker

File upload

Mention autocomplete

Slash-command autocomplete

Reply preview

Edit mode

Drag-and-drop uploads

Paste images

Upload progress

14. THREADS

Implement threaded conversations.

Features:

Create thread

Reply in thread

Thread participants

Thread notifications

Thread archive

Thread search

Thread permissions

Thread unread state

15. SEARCH

Create powerful global and server search.

Search by:

Message content

User

Channel

Date

Before date

After date

Attachments

Links

Mentions

Pinned messages

Search results should be fast and paginated.

16. NOTIFICATIONS

Implement:

Push notifications

In-app notifications

Desktop notifications

Mobile notifications

Mention notifications

DM notifications

Friend notifications

Server notifications

Notification settings:

All messages

Mentions only

Nothing

Mute server

Mute channel

Custom notification preferences

17. VOICE SYSTEM

Implement high-quality real-time voice.

Use WebRTC and an appropriate media server architecture.

Features:

Join voice

Leave voice

Mute

Deafen

Self mute

Self deafen

User volume

Voice activity detection

Push-to-talk

Noise suppression

Echo cancellation

Input/output device selection

Connection quality indicator

Reconnection

Speaking indicators

18. VIDEO

Implement:

Camera on/off

Camera selection

Video quality controls

Grid layout

Speaker view

Fullscreen

Picture-in-picture

Multiple participants

Connection indicators

19. SCREEN SHARING

Implement:

Screen sharing

Window sharing

Tab sharing where supported

Audio sharing where supported

Resolution selection

Frame-rate selection

Viewer controls

Fullscreen viewing

20. MODERATION

Create comprehensive moderation tools.

Actions:

Warn

Timeout

Kick

Ban

Unban

Message deletion

Slow mode

Lock channel

Lock server

Restrict users

Moderation logs:

Member joined

Member left

Message deleted

Message edited

User banned

User kicked

Role changed

Channel created

Channel deleted

Permission changed

Invite created/revoked

21. AUTOMODERATION

Implement configurable automatic moderation.

Rules can detect:

Spam

Excessive mentions

Repeated messages

Banned words

Suspicious links

Invite spam

Excessive caps

Rapid message sending

Actions:

Delete

Warn

Timeout

Block message

Alert moderators

22. INVITES

Create invite links.

Support:

Expiration

Maximum uses

Temporary membership

Invite tracking

Revocation

Vanity-style invite codes if configured

23. BOTS AND INTEGRATIONS

Create a bot/integration framework.

Features:

Bot accounts

Bot tokens

OAuth-style authorization

Webhooks

Slash commands

Context commands

Events

Permissions

Bot role

API access

Developer portal should allow developers to:

Create applications

Create bots

Manage credentials

Configure commands

Configure webhooks

Configure OAuth scopes

View API usage

Never expose secret credentials to the frontend.

24. WEBHOOKS

Support:

Create webhook

Edit webhook

Delete webhook

Rotate token

Avatar

Name

Target channel

Webhook messages

25. CUSTOM EMOJIS AND STICKERS

Servers can upload custom:

Emojis

Animated emojis where supported

Stickers

Include:

Upload

Delete

Rename

Permissions

Usage

Search

Emoji picker integration

26. SERVER SETTINGS

Create a complete settings interface.

Sections:

Overview

Roles

Members

Invites

Moderation

Safety

Auto moderation

Channels

Integrations

Webhooks

Emojis

Stickers

Notifications

Audit log

Community settings

Server deletion

27. USER SETTINGS

Create a complete settings application.

Sections:

Account

Profile

Username

Email

Password

2FA

Sessions

Privacy

Direct message permissions

Friend requests

Presence visibility

Blocked users

Notifications

Desktop

Mobile

Email

Mentions

Sounds

Appearance

Light/dark/system theme

Accent color

Font scaling

Compact/cozy message density

Reduced motion

Accessibility

Voice & Video

Input device

Output device

Camera

Mic sensitivity

Noise suppression

Echo cancellation

Push-to-talk

28. HOME / FRIENDS PAGE

Create a home dashboard.

Sections:

Friends

Online

All

Pending

Blocked

Add friend

Include:

Search

Friend actions

Presence

Quick DM

Voice call

29. RESPONSIVE DESIGN

The application must work on:

Desktop

Laptop

Tablet

Mobile

Mobile navigation should include:

Home

DMs

Servers

Current channel

Profile/settings

Do not simply shrink the desktop interface.

Create an intentionally designed mobile experience.

30. ACCESSIBILITY

Implement:

Keyboard navigation

Focus states

Screen reader support

ARIA labels

Reduced motion

High contrast

Accessible dialogs

Accessible menus

Accessible tooltips

Proper semantic HTML

All major functions must be usable without a mouse.

31. PERFORMANCE

Optimize aggressively.

Use:

Virtualized message lists

Lazy loading

Code splitting

Image optimization

CDN

Redis caching

Database indexes

Efficient WebSocket subscriptions

Debounced search

Optimistic updates

Background processing

The UI should remain responsive with:

Thousands of messages

Large servers

Many channels

Large member lists

32. REAL-TIME ARCHITECTURE

Use WebSockets for:

Messages

Typing

Presence

Reactions

Message edits

Message deletion

Friend requests

Voice state

Notifications

Channel updates

Role changes

Server events

Implement:

Reconnection

Heartbeats

Connection state

Event sequencing

Duplicate event protection

Horizontal scaling

Redis pub/sub or equivalent

33. DATABASE

Create a normalized PostgreSQL schema.

At minimum include:

users

sessions

accounts

friendships

blocks

servers

server_members

roles

permissions

role_members

channels

channel_permissions

messages

message_reactions

attachments

threads

thread_members

invites

bans

timeouts

audit_logs

notifications

custom_emojis

stickers

webhooks

bots

applications

integrations

voice_sessions

Add proper:

Foreign keys

Unique constraints

Indexes

Cascading behavior

Pagination indexes

Timestamp fields

34. API

Create a clean API architecture.

Implement endpoints for:

Authentication

Users

Profiles

Friends

DMs

Servers

Members

Channels

Messages

Threads

Roles

Permissions

Invites

Moderation

Notifications

Files

Emojis

Stickers

Bots

Webhooks

Integrations

Search

Use:

Strong validation

Typed request/response schemas

Consistent error handling

Authentication middleware

Authorization middleware

Rate limits

35. FILE UPLOADS

Support:

Images

Videos

Audio

Documents

GIFs

Requirements:

File-size limits

MIME validation

Extension validation

Virus/malware scanning integration

Image processing

Thumbnail generation

Object storage

Signed URLs

CDN delivery

36. ADMIN DASHBOARD

Create a platform administration dashboard.

Include:

Users

Servers

Reports

Bans

Abuse reports

System health

API usage

Storage usage

WebSocket connections

Error logs

Moderation actions

Add role-based admin permissions.

37. REPORTING SYSTEM

Users should be able to report:

Users

Messages

Servers

Bots

Content

Reports should include:

Reporter

Target

Reason

Evidence

Timestamp

Status

Moderator

Resolution

38. ERROR HANDLING

Every feature must have:

Loading states

Empty states

Error states

Retry buttons

Offline states

Skeleton loaders

Toast notifications

Never allow unhandled exceptions to break the application.

39. DESIGN SYSTEM

Create a consistent design system.

Include:

Buttons

Inputs

Dropdowns

Modals

Tooltips

Context menus

Tabs

Cards

Badges

Avatars

Menus

Toasts

Sliders

Toggles

Selects

Command palette

Create reusable components rather than duplicating UI.

40. VISUAL QUALITY

The application should feel like a polished commercial product.

Prioritize:

Smooth animations

Clear hierarchy

Consistent spacing

Excellent typography

Fast interactions

Subtle hover effects

Clear active states

Beautiful dark mode

Responsive layouts

Professional empty states

Professional loading states

Do not create a generic admin dashboard.

It should feel like a real communication application.

41. SECURITY

Implement security from the beginning.

Include:

Authentication

Authorization

Rate limiting

CSRF protection

XSS protection

SQL injection protection

Content validation

File validation

Permission checks

Abuse prevention

Session invalidation

Secure cookies

Encryption where appropriate

Secrets management

Audit logging

Never trust client-side permissions.

All permission checks must also occur server-side.

42. TESTING

Create:

Unit tests

For:

Permissions

Authentication

Message services

Moderation

Database services

Integration tests

For:

APIs

WebSockets

Authentication

Messages

Server creation

Permissions

End-to-end tests

For:

Registration

Login

Creating a server

Joining a server

Sending messages

Creating channels

Creating roles

Moderation

Voice joining

Settings

43. DEVELOPMENT EXPERIENCE

Provide:

.env.example

Database migrations

Seed data

Docker configuration

Development scripts

Production scripts

README

API documentation

Architecture documentation

The application must run locally with a simple setup.

44. DEMO DATA

Create realistic seed data:

Multiple users

Multiple servers

Server categories

Text channels

Voice channels

Roles

Messages

Reactions

Friend relationships

The application should look populated immediately after setup.

45. UI PAGES

Implement at minimum:

Login

Register

Forgot password

Home

Friends

DM

Server

Channel

Thread

Search

User profile

User settings

Server settings

Server discovery

Invite page

Developer portal

Admin dashboard

Moderation dashboard

Error pages

46. IMPORTANT IMPLEMENTATION RULES

Do NOT build fake buttons.

Every visible interactive element must have a working implementation or clearly be marked as unavailable.

Do NOT use static mock data as the final implementation.

Do NOT hardcode permissions.

Do NOT put sensitive logic exclusively in the frontend.

Do NOT expose API secrets.

Do NOT create a fake WebSocket layer that doesn't actually synchronize clients.

Do NOT create fake voice/video functionality.

Do NOT leave major features as TODO placeholders.

47. DEVELOPMENT PROCESS

Build the application incrementally.

Phase 1

Set up:

Repository

Frontend

Backend

Database

Authentication

Basic design system

Phase 2

Implement:

Users

Profiles

Friends

DMs

Messaging

WebSockets

Phase 3

Implement:

Servers

Channels

Categories

Roles

Permissions

Invites

Phase 4

Implement:

Threads

Search

Notifications

Attachments

Emojis

Reactions

Phase 5

Implement:

Voice

Video

Screen sharing

Presence

Phase 6

Implement:

Moderation

Auto moderation

Audit logs

Reporting

Phase 7

Implement:

Bots

Webhooks

Developer portal

Integrations

Phase 8

Implement:

Admin dashboard

Analytics

Performance optimization

Security hardening

Phase 9

Implement:

Automated tests

Production deployment

Monitoring

Documentation

48. FINAL ACCEPTANCE CRITERIA

Before considering the project complete, verify that a new user can:

Register

Log in

Configure their profile

Add a friend

Send a DM

Create a server

Create categories

Create text channels

Create voice channels

Create roles

Configure permissions

Invite another user

Send messages

Reply to messages

React to messages

Upload files

Search messages

Create threads

Join voice

Use microphone

Use camera

Share screen

Moderate members

Configure notifications

Configure privacy

Customize appearance

Manage server settings

Create a bot/integration

Use webhooks

Receive real-time updates

Test all of these flows before declaring the application finished.

49. OUTPUT REQUIREMENTS FOR THE AI CODING AGENT

Do not merely describe how to build the application.

Actually implement it.

When generating the project:

Create the complete folder structure

Create all required files

Write the actual code

Create database migrations

Create API routes

Create frontend pages

Create reusable components

Create WebSocket events

Create authentication

Create authorization

Create tests

Create documentation

If a dependency is required, add it to the project.

If a feature requires external infrastructure, create a clean abstraction and provide a local development implementation.

At the end, provide:

Project structure

Setup instructions

Environment variables

Database setup

Development commands

Production deployment instructions

Test commands

Known limitations

Security considerations

Do not stop after creating the UI.

The final result must be a fully functional full-stack Discord-style communication platform, not a static prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/274644f8-7402-4742-923b-c33286cff48d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
