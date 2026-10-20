# ToneRelay Guide

## Tool introduction

### Extend your Agent’s ability to work with Lightroom

ToneRelay is a **local MCP tool** that connects your Agent with Lightroom Classic. The Agent understands your request and decides how to edit; ToneRelay executes changes through the Lightroom plugin and brings back the adjusted photo.

**50+ MCP tools** · **Batch operations** · **Subject masks** · **XMP Develop parameter passthrough and readback** · **Actual rendered previews** · **Image measurement and comparison**

Compared with asking an Agent to find buttons in Lightroom screenshots, ToneRelay reduces repeated screenshots, control searches, and individual clicks. It also reads back the actual adjustments and rendered images.

## Describe the goal. See the result.

The gallery also offers style and effects packs created by Reef. Download one and give its notes and reference images to your Agent. The gallery will continue to grow.

<!-- comparison-content:start -->
```json
{
  "note": "Images come from the author’s actual workflow records. No comparative speed or token-usage tests have been performed.",
  "sceneEntries": [
    {
      "no": "01",
      "name": "View Catalog information",
      "desc": "",
      "prompts": ["Show the current Lightroom Catalog information and my currently selected photo."]
    },
    {
      "no": "02",
      "name": "Select and mark photos",
      "desc": "Have your Agent inspect each photo and apply stars or flags using your criteria",
      "prompts": ["Review this set one photo at a time and rate them for sharpness and content. Mark clearly blurry photos as rejected first."]
    },
    {
      "no": "03",
      "name": "Match colors and refine",
      "desc": "Give your Agent a few references and try a look for each photo. Keep refining after seeing the results",
      "prompts": [
        "Use the colors in these references to grade this set one photo at a time. Choose the most suitable reference for each photo.",
        "The shadows are a little too heavy. Lift them slightly and keep skin tones from going yellow. Show me another before-and-after comparison."
      ]
    }
  ],
  "shots": {
    "sliders": {
      "alt": "A mountain photo in Lightroom Classic’s Develop module, with color-adjustment sliders on the right",
      "caption": "Lightroom Classic · Adjusting sliders one by one"
    },
    "masks": {
      "alt": "A mountain photo and the mask-adjustment panel in Lightroom Classic",
      "caption": "Switch masks and adjust a local area"
    },
    "landscape": {
      "alt": "A grassy landscape photo and the Develop settings panel in Lightroom Classic",
      "caption": "Move to another photo and continue editing"
    },
    "refine": {
      "alt": "Agent conversation screenshot: after seeing the first version, the user asks for overly dark shadows to be lifted and the color tone checked; the Agent returns a second version",
      "caption": "See the first version, then say what needs changing"
    },
    "loupe": {
      "alt": "Lightroom Classic’s Loupe view and bottom filmstrip, browsing photos one at a time",
      "caption": "Lightroom Classic · Browsing one photo at a time"
    },
    "grid": {
      "alt": "Thumbnails of a set of portrait photos in Lightroom Classic’s Catalog grid",
      "caption": "View the whole set"
    },
    "compare": {
      "alt": "Two portrait photos displayed side by side in Lightroom Classic’s Compare view",
      "caption": "Compare side by side and decide which to keep"
    },
    "rating": {
      "alt": "Agent conversation screenshot: each photo in a set is rated, a star-rating distribution is returned, and the ratings are written back to the Catalog",
      "caption": "The Agent rates each photo and writes the marks back to Lightroom"
    },
    "color": {
      "alt": "Agent conversation screenshot: the user provides nine reference images and an editing goal; the Agent chooses references according to each photo’s lighting, gives 14 photos a rich color treatment, and returns rendered previews for each",
      "caption": "Reference-based color grading, with results for each photo"
    },
    "mask": {
      "alt": "Agent conversation screenshot: the user asks for separate adjustments to the person and overall image; the Agent uses global settings and a subject mask, returning original-versus-virtual-copy comparisons and actual parameter readbacks",
      "caption": "Global and subject-mask adjustments, before and after"
    }
  },
  "first": {
    "number": "01",
    "label": "Conversational editing",
    "title": "Start with the image you have in mind.",
    "description": "Tell your Agent the look you want. It uses ToneRelay to adjust Lightroom and bring the photo back. Look at the result and say what needs changing, without finding every slider yourself.",
    "beforeLabel": "Manual editing",
    "beforeTitle": "Adjust each setting and preview repeatedly",
    "beforeFooter": "Adjust → Preview → Adjust again",
    "afterLabel": "Agent + ToneRelay",
    "afterTitle": "Describe the goal, then refine the result",
    "afterFooter": "Find a suitable reference and edit the current photo",
    "takeaway": "See the adjusted photo in every round. Then tell your Agent what to change next.",
    "benefits": ["Describe your goal", "Inspect details and compare", "Keep refining"]
  },
  "batch": {
    "number": "02",
    "label": "Batch operations",
    "title": "Work through a whole set in conversation.",
    "description": "Have your Agent inspect each photo and apply stars or flags using your criteria.",
    "beforeLabel": "Reviewing individually",
    "beforeTitle": "Open, assess, then switch",
    "beforeFooter": "Open each photo → Mark → Compare repeatedly",
    "afterLabel": "Agent + ToneRelay",
    "afterTitle": "Inspect each photo; keep the marks in Lightroom",
    "afterFooter": "Read Lightroom’s quick previews and reuse cached previews when available",
    "takeaway": "When larger images are needed, your Agent can export JPEGs into the conversation. Ratings and flags are written back to Lightroom.",
    "benefits": ["Inspect each photo", "Mark using your criteria", "Write back to Lightroom"]
  },
  "computer": {
    "number": "03",
    "label": "Real examples",
    "title": "From local masks to color grading a set.",
    "description": "Your Agent can use Lightroom’s color sliders and subject masks through ToneRelay, adjusting the overall image and the person separately. After seeing rendered previews, keep asking for specific changes. With reference images, it can also grade a set one photo at a time.",
    "beforeLabel": "Subject masks",
    "beforeTitle": "Adjust the person and overall image separately",
    "beforeFooter": "Combine global settings with subject masks and compare before and after",
    "afterLabel": "Reference-based color matching",
    "afterTitle": "Nine references, chosen for each photo",
    "afterFooter": "Choose references by lighting and return actual rendered previews to the conversation",
    "takeaway": "Both examples come from real workflows. Adjustments are saved in Lightroom virtual copies. After seeing previews, you can keep pointing out details.",
    "benefits": ["Combine global adjustments and masks", "Match colors photo by photo", "Keep refining in conversation"],
    "followups": ["The person’s brightness looks right. Bring down the overall highlights a little more."]
  }
}
```
<!-- comparison-content:end -->
