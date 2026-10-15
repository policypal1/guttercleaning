# Salem Gutter Pros - one-page website

A clean, fast, responsive one-page website for **Salem Gutter Pros**.

## Files

- `index.html` - the entire page, SEO metadata, and quote form
- `style.css` - all design and responsive styles
- `script.js` - mobile navigation and text-message quote flow
- `assets/` - the hero and service WebP images plus favicon

## Run locally

You can double-click `index.html` to preview the site. For the most accurate preview, serve the folder with a local HTTP server, e.g. `python3 -m http.server 8080`, and visit `http://localhost:8080`.

## Upload / launch

Upload **all the contents** of this folder together to your web host or GitHub Pages repository. Keep `index.html` at the repository/site root, and preserve the `assets/` folder and filenames. No build step, Node.js, or frameworks are needed.

## Important: how the form works

There is **no backend and no email address was supplied**. So the quote form does *not* save leads to a database or send email. After a visitor enters a name and location, the form prepares a text message addressed to **(503) 569-4291** and attempts to open the device's SMS app. The customer must press Send. There is a fallback **Copy Request** option. If this number cannot receive texts, replace the SMS flow with a real form backend before publishing.

If you want an actual online lead form later, connect an email/form provider (Netlify Forms, Formspree, your own backend, etc.), adjust the form submission code, test, and add a privacy notice explaining where customer details go.

## Changes to make before advertising

1. Confirm you want to use the working business name **Salem Gutter Pros** and verify name/domain availability.
2. Confirm 503-569-4291 receives both calls and texts. There are 5 telephone links and SMS logic using this number.
3. Verify your precise service area, actual services, job capacity, insurance and under-18 labor requirements before taking gutter jobs.
4. Replace illustrative images with photos of your **actual work** when available. Do not claim stock/illustrative images are customer jobs.
5. If you connect a custom domain, change `og:image` to an absolute HTTPS URL and add your domain to your SEO tools.
6. Test the quote flow on an iPhone, an Android phone, and desktop. SMS URI behavior varies by OS.
7. For a business with an online lead form, provide a proper privacy policy before enabling data collection.

## Design notes

- Forest green, warm white, charcoal, and soft spring-green highlights
- Full-bleed autumn home image with a dark gradient hero
- Light services > dark story > light steps > dark quote section
- Mobile-first CTAs and sticky call/quote bar
- No invented reviews, years of experience, certification badges, or insurance claims

## Images

The five WebP assets were created from illustrative generated imagery for this site. They are **not photos of real Salem Gutter Pros jobs**. The `assets/salem-home-autumn.webp` asset shows a conceptual residential exterior, and the other assets are illustrative gutter imagery. Update with authentic project photos as soon as you have them.
