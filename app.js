const STORAGE_KEY = "floralens.v2";
const PHOTO_DB = "floralens-photos";
const PHOTO_STORE = "photos";

/*
  Set this to your deployed Cloudflare Worker URL after setup, e.g.
  const API_PROXY_URL = "https://floralens-api.yourname.workers.dev";
  Never put your Pl@ntNet API key in this browser file.
*/
const API_PROXY_URL = "https://floralens-api.lrthumwood.workers.dev";
const journalPhotoInput=document.createElement("input");
journalPhotoInput.type="file";
journalPhotoInput.accept="image/*";
journalPhotoInput.setAttribute("capture","environment");
journalPhotoInput.hidden=true;
document.body.appendChild(journalPhotoInput);
let pendingJournalPhotoFile=null;
let pendingJournalPlantId=null;



const FLORALENS_CARE_LIBRARY = {
  "lavandula angustifolia": {
    "commonName": "English lavender",
    "light": "Full sun",
    "water": "Water while establishing; once established, water sparingly and avoid prolonged wet soil.",
    "soil": "Very free-draining soil; neutral to alkaline conditions are usually suitable.",
    "height": "About 40–90 cm, depending on cultivar and conditions",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Woody, aromatic evergreen subshrub",
    "pruning": "Trim after flowering, keeping some green growth below the cut. Avoid cutting hard into old bare wood.",
    "propagation": "Semi-ripe cuttings in summer are usually reliable.",
    "hardiness": "Generally hardy in UK gardens when drainage is good.",
    "seasonal": {
      "spring": "Remove winter damage and tidy lightly once strong new growth is visible.",
      "summer": "Enjoy flowering; trim after the main flush if a compact shape is wanted.",
      "autumn": "Avoid heavy pruning late in the year.",
      "winter": "Protect from waterlogged soil; winter wet is often more troublesome than cold."
    }
  },
  "lavandula": {
    "light": "Full sun",
    "water": "Low to moderate once established; avoid waterlogging.",
    "soil": "Very free-draining soil is important.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Aromatic evergreen or semi-evergreen subshrub",
    "pruning": "Trim after flowering rather than cutting hard into old woody stems.",
    "hardiness": "Varies by species and cultivar; winter drainage is especially important."
  },
  "hydrangea macrophylla": {
    "commonName": "Mophead / lacecap hydrangea",
    "light": "Part shade or gentle sun; shelter from intense drying heat.",
    "water": "Keep evenly moist, especially in warm weather and while establishing.",
    "soil": "Moist but well-drained, humus-rich soil.",
    "height": "Commonly around 1–2 m",
    "bloomMonths": [
      7,
      8,
      9
    ],
    "growthHabit": "Deciduous flowering shrub",
    "pruning": "Prune lightly in spring, removing old flowerheads and dead wood. Many cultivars flower on older stems, so avoid indiscriminate hard pruning.",
    "propagation": "Softwood cuttings are commonly taken in summer.",
    "hardiness": "Generally hardy in much of the UK; young growth can be damaged by late frost."
  },
  "hydrangea": {
    "light": "Part shade to sun, with more shelter in hotter or drier positions.",
    "water": "Usually prefers consistent moisture.",
    "soil": "Moist but well-drained, humus-rich soil.",
    "bloomMonths": [
      7,
      8,
      9
    ],
    "growthHabit": "Usually a deciduous shrub or climber",
    "hardiness": "Varies by species and cultivar."
  },
  "rosa": {
    "light": "Full sun is best for most roses; some tolerate light shade.",
    "water": "Water deeply in dry spells, especially newly planted roses.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Deciduous flowering shrub or climber",
    "pruning": "Main pruning is usually carried out in the dormant season; technique depends on whether the rose is shrub, climbing or rambling.",
    "propagation": "Hardwood or semi-ripe cuttings can be used; named cultivars may not come true from seed.",
    "hardiness": "Many garden roses are hardy across much of the UK, but cultivar differences matter."
  },
  "salvia rosmarinus": {
    "commonName": "Rosemary",
    "light": "Full sun",
    "water": "Low to moderate once established; avoid persistently wet roots.",
    "soil": "Free-draining soil.",
    "height": "Usually around 0.8–1.5 m, depending on cultivar",
    "bloomMonths": [
      3,
      4,
      5,
      6
    ],
    "growthHabit": "Aromatic evergreen shrub",
    "pruning": "Trim lightly after flowering to keep compact; avoid cutting back into old bare wood.",
    "propagation": "Semi-ripe cuttings root readily in summer.",
    "hardiness": "Generally hardy in sheltered UK gardens with good drainage."
  },
  "rosmarinus officinalis": {
    "commonName": "Rosemary",
    "light": "Full sun",
    "water": "Low to moderate once established; avoid persistently wet roots.",
    "soil": "Free-draining soil.",
    "height": "Usually around 0.8–1.5 m, depending on cultivar",
    "bloomMonths": [
      3,
      4,
      5,
      6
    ],
    "growthHabit": "Aromatic evergreen shrub",
    "pruning": "Trim lightly after flowering to keep compact; avoid cutting back into old bare wood.",
    "propagation": "Semi-ripe cuttings root readily in summer.",
    "hardiness": "Generally hardy in sheltered UK gardens with good drainage."
  },
  "digitalis purpurea": {
    "commonName": "Foxglove",
    "light": "Part shade to sun",
    "water": "Moderate; avoid prolonged drought while establishing.",
    "soil": "Moist but well-drained soil with organic matter.",
    "height": "Often around 1–1.5 m in flower",
    "bloomMonths": [
      5,
      6,
      7
    ],
    "growthHabit": "Usually biennial or short-lived perennial",
    "pruning": "Remove spent spikes to reduce self-seeding, or leave some if you want naturalised seedlings.",
    "hardiness": "Hardy in UK conditions.",
    "safety": "Toxic if eaten. Avoid ingestion and keep away from pets or young children likely to chew plants."
  },
  "buxus sempervirens": {
    "commonName": "Common box",
    "light": "Sun to shade",
    "water": "Moderate; established plants tolerate some dryness.",
    "soil": "Well-drained soil; avoid persistently waterlogged ground.",
    "height": "Can exceed 2 m untrimmed, but commonly kept much smaller",
    "growthHabit": "Dense evergreen shrub",
    "pruning": "Clip during the growing season for formal shapes, avoiding very hot dry weather.",
    "hardiness": "Hardy in UK gardens.",
    "safety": "All parts are harmful if eaten."
  },
  "acer": {
    "light": "Sun to part shade; many Japanese maples prefer shelter from scorching sun and wind.",
    "water": "Keep evenly moist while establishing; avoid prolonged waterlogging.",
    "soil": "Moist but well-drained soil; many species prefer slightly acidic to neutral conditions.",
    "growthHabit": "Deciduous tree or shrub",
    "hardiness": "Many garden maples are hardy in the UK; exposure tolerance varies by species.",
    "pruning": "Prune only when necessary, generally avoiding heavy pruning during active sap flow."
  },
  "agapanthus": {
    "light": "Full sun",
    "water": "Water regularly in active growth; reduce in winter.",
    "soil": "Fertile, well-drained soil.",
    "bloomMonths": [
      7,
      8,
      9
    ],
    "growthHabit": "Clump-forming perennial",
    "hardiness": "Hardiness varies; evergreen forms are often less hardy than deciduous forms.",
    "pruning": "Remove spent flower stems and dead foliage as needed."
  },
  "alchemilla": {
    "light": "Sun to part shade",
    "water": "Moderate; established plants cope with short dry spells.",
    "soil": "Most reasonably fertile, well-drained soils.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Low, clump-forming herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut back untidy flowers and foliage after flowering to encourage fresh growth."
  },
  "allium": {
    "light": "Full sun",
    "water": "Moderate during growth; avoid wet dormant soil.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7
    ],
    "growthHabit": "Bulbous perennial",
    "hardiness": "Most ornamental alliums are hardy in UK gardens.",
    "pruning": "Leave foliage to die back naturally after flowering."
  },
  "anemone": {
    "light": "Sun to part shade, depending on species.",
    "water": "Moderate; keep evenly moist during active growth.",
    "soil": "Humus-rich, well-drained soil.",
    "bloomMonths": [
      3,
      4,
      5,
      8,
      9,
      10
    ],
    "growthHabit": "Herbaceous perennial or tuberous plant",
    "hardiness": "Many garden anemones are hardy; species differ."
  },
  "aquilegia": {
    "light": "Sun to part shade",
    "water": "Moderate; avoid prolonged drought.",
    "soil": "Moist but well-drained soil.",
    "bloomMonths": [
      5,
      6
    ],
    "growthHabit": "Short-lived herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut back after flowering if you want to limit self-seeding."
  },
  "astilbe": {
    "light": "Part shade; tolerates sun if soil stays moist.",
    "water": "Likes consistent moisture and dislikes drying out.",
    "soil": "Moist, humus-rich soil.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Clump-forming herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut old stems to the ground in late winter or early spring."
  },
  "begonia": {
    "light": "Bright shade or gentle sun; avoid harsh midday sun for many types.",
    "water": "Keep moderately moist but not waterlogged.",
    "soil": "Free-draining, humus-rich compost or soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tender perennial often grown as an annual",
    "hardiness": "Many bedding and tuberous begonias are frost tender in the UK."
  },
  "bergenia": {
    "light": "Sun to shade",
    "water": "Moderate; established plants are fairly tolerant.",
    "soil": "Moist but well-drained soil.",
    "bloomMonths": [
      3,
      4,
      5
    ],
    "growthHabit": "Evergreen clump-forming perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Remove damaged leaves and spent flower stems."
  },
  "buddleja": {
    "light": "Full sun",
    "water": "Moderate while establishing; fairly drought tolerant once established.",
    "soil": "Well-drained soil; tolerates relatively poor soils.",
    "bloomMonths": [
      7,
      8,
      9
    ],
    "growthHabit": "Deciduous or semi-evergreen flowering shrub",
    "hardiness": "Many common garden forms are hardy in the UK.",
    "pruning": "Many Buddleja davidii types are cut back hard in early spring; other species differ."
  },
  "camellia": {
    "light": "Part shade or sheltered dappled light",
    "water": "Keep evenly moist, especially during bud formation and dry weather.",
    "soil": "Acidic, humus-rich, well-drained soil.",
    "bloomMonths": [
      2,
      3,
      4,
      5
    ],
    "growthHabit": "Evergreen flowering shrub",
    "hardiness": "Many cultivars are hardy, but flower buds can be damaged by severe frost.",
    "pruning": "Usually needs little pruning; shape after flowering if required."
  },
  "campanula": {
    "light": "Sun to part shade",
    "water": "Moderate; avoid waterlogging.",
    "soil": "Well-drained soil; many tolerate poorer ground.",
    "bloomMonths": [
      5,
      6,
      7,
      8
    ],
    "growthHabit": "Herbaceous or evergreen perennial",
    "hardiness": "Many garden campanulas are hardy.",
    "pruning": "Deadhead or trim after flowering to encourage tidiness and sometimes a second flush."
  },
  "ceanothus": {
    "light": "Full sun in a sheltered position",
    "water": "Moderate while establishing; avoid winter wet.",
    "soil": "Free-draining soil.",
    "bloomMonths": [
      4,
      5,
      6
    ],
    "growthHabit": "Evergreen or deciduous flowering shrub",
    "hardiness": "Hardiness varies; many evergreen types benefit from shelter.",
    "pruning": "Prune lightly after flowering; avoid cutting hard into old wood."
  },
  "choisya": {
    "light": "Sun to part shade",
    "water": "Moderate; water while establishing.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      4,
      5,
      6,
      8,
      9
    ],
    "growthHabit": "Evergreen flowering shrub",
    "hardiness": "Generally hardy in sheltered UK gardens.",
    "pruning": "Trim after flowering if needed; avoid severe pruning unless rejuvenating."
  },
  "clematis": {
    "light": "Sun to part shade; many prefer cool, shaded roots with growth reaching the light.",
    "water": "Water regularly while establishing and during dry spells.",
    "soil": "Deep, fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      4,
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Climbing perennial",
    "hardiness": "Many cultivars are hardy in the UK.",
    "pruning": "Pruning depends on flowering group, so identify the cultivar or group before cutting back heavily."
  },
  "cornus": {
    "light": "Sun to part shade",
    "water": "Moderate; many prefer soil that does not dry out severely.",
    "soil": "Moist but well-drained soil.",
    "growthHabit": "Deciduous shrub or small tree",
    "hardiness": "Many garden dogwoods are hardy.",
    "pruning": "Pruning depends on type: coloured-stem dogwoods are often cut hard in spring, while flowering trees need lighter treatment."
  },
  "cosmos": {
    "light": "Full sun",
    "water": "Moderate; avoid overwatering.",
    "soil": "Well-drained soil; too much fertility can produce leaves at the expense of flowers.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tender annual",
    "hardiness": "Frost tender.",
    "pruning": "Deadhead regularly to extend flowering."
  },
  "crocus": {
    "light": "Sun to part shade",
    "water": "Usually needs little extra water once established.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      2,
      3,
      4,
      9,
      10
    ],
    "growthHabit": "Corm-forming perennial",
    "hardiness": "Most common garden crocuses are hardy.",
    "pruning": "Let foliage die back naturally after flowering."
  },
  "dahlia": {
    "light": "Full sun",
    "water": "Water regularly in dry weather, especially in containers.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tuberous tender perennial",
    "hardiness": "Top growth is frost tender; tubers may need winter protection depending on location and soil.",
    "pruning": "Deadhead often; pinch young plants for bushier growth if desired."
  },
  "delphinium": {
    "light": "Full sun with shelter from strong wind",
    "water": "Keep evenly moist in active growth.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Tall herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut spent flower spikes after the first flush; some plants rebloom later.",
    "safety": "Harmful if eaten; avoid ingestion."
  },
  "dianthus": {
    "light": "Full sun",
    "water": "Moderate; avoid soggy soil.",
    "soil": "Free-draining, neutral to alkaline soil suits many types.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Evergreen or semi-evergreen perennial",
    "hardiness": "Many garden pinks are hardy.",
    "pruning": "Deadhead regularly and trim lightly after flowering."
  },
  "echinacea": {
    "light": "Full sun",
    "water": "Moderate while establishing; reasonably drought tolerant once established.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      7,
      8,
      9
    ],
    "growthHabit": "Herbaceous perennial",
    "hardiness": "Hardy in most UK gardens if winter drainage is good.",
    "pruning": "Leave seed heads for winter interest or cut down after flowering."
  },
  "erica": {
    "light": "Sun to part shade",
    "water": "Moderate; avoid prolonged drought.",
    "soil": "Usually acidic to neutral and free-draining; exact preference varies by species.",
    "bloomMonths": [
      1,
      2,
      3,
      4,
      8,
      9,
      10,
      11,
      12
    ],
    "growthHabit": "Low evergreen shrub",
    "hardiness": "Many heathers are hardy.",
    "pruning": "Trim lightly after flowering, avoiding old leafless wood."
  },
  "euonymus": {
    "light": "Sun to shade, depending on cultivar.",
    "water": "Moderate; established plants are fairly tolerant.",
    "soil": "Well-drained soil.",
    "growthHabit": "Evergreen or deciduous shrub",
    "hardiness": "Many garden forms are hardy.",
    "pruning": "Trim to shape during the growing season if required."
  },
  "forsythia": {
    "light": "Full sun to part shade",
    "water": "Moderate while establishing.",
    "soil": "Most fertile, well-drained soils.",
    "bloomMonths": [
      3,
      4
    ],
    "growthHabit": "Deciduous flowering shrub",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Prune after flowering, removing some older stems to keep the shrub open."
  },
  "fuchsia": {
    "light": "Part shade or gentle sun, sheltered from drying winds.",
    "water": "Keep evenly moist in active growth.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Shrub or tender perennial",
    "hardiness": "Hardiness varies greatly; many bedding types are frost tender."
  },
  "galanthus": {
    "light": "Part shade to sun before trees leaf out",
    "water": "Usually needs little extra watering in suitable ground.",
    "soil": "Moist but well-drained, humus-rich soil.",
    "bloomMonths": [
      1,
      2,
      3
    ],
    "growthHabit": "Bulbous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Allow foliage to die back naturally."
  },
  "geranium": {
    "light": "Sun to part shade, depending on species.",
    "water": "Moderate; many hardy geraniums tolerate short dry spells once established.",
    "soil": "Most reasonably fertile, well-drained soils.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Clump-forming hardy perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Many hardy geraniums respond well to cutting back after the first flush."
  },
  "helleborus": {
    "light": "Part shade",
    "water": "Moderate; dislikes prolonged waterlogging.",
    "soil": "Humus-rich, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      1,
      2,
      3,
      4
    ],
    "growthHabit": "Evergreen or semi-evergreen perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Remove damaged old foliage before flowers emerge if needed.",
    "safety": "Harmful if eaten and sap may irritate skin; handle with sensible care."
  },
  "hebe": {
    "light": "Sun to part shade in a sheltered position",
    "water": "Moderate; avoid prolonged waterlogging.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Evergreen shrub",
    "hardiness": "Hardiness varies by cultivar; smaller-leaved forms are often tougher.",
    "pruning": "Trim lightly after flowering; avoid cutting hard into old bare wood."
  },
  "heuchera": {
    "light": "Part shade to sun; darker-leaved cultivars often tolerate more sun.",
    "water": "Moderate; avoid waterlogged crowns.",
    "soil": "Humus-rich, well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8
    ],
    "growthHabit": "Evergreen or semi-evergreen clump-forming perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Remove old leaves and spent flower stems; lift and replant if crowns become woody."
  },
  "hosta": {
    "light": "Part shade to shade; some cultivars tolerate more sun with adequate moisture.",
    "water": "Keep evenly moist, especially during active growth.",
    "soil": "Moist, fertile, humus-rich soil.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Herbaceous clump-forming perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Remove collapsed foliage after frost."
  },
  "ilex": {
    "light": "Sun to shade, depending on species and cultivar.",
    "water": "Moderate while establishing.",
    "soil": "Moist but well-drained soil.",
    "growthHabit": "Evergreen or deciduous shrub or tree",
    "hardiness": "Many hollies are hardy.",
    "pruning": "Prune to shape in late spring or summer if needed.",
    "safety": "Berries can be harmful if eaten in quantity; avoid ingestion."
  },
  "iris": {
    "light": "Full sun for many bearded types; some moisture-loving irises prefer damper sites.",
    "water": "Moderate; needs vary strongly by type.",
    "soil": "Well-drained for bearded iris; moisture-retentive for bog or water irises.",
    "bloomMonths": [
      5,
      6,
      7
    ],
    "growthHabit": "Rhizomatous or bulbous perennial",
    "hardiness": "Many garden irises are hardy.",
    "pruning": "Remove spent flower stems and damaged leaves."
  },
  "jasminum": {
    "light": "Sun to part shade in a sheltered position",
    "water": "Moderate; water during prolonged dry spells while establishing.",
    "soil": "Fertile, well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      12,
      1,
      2
    ],
    "growthHabit": "Climbing shrub",
    "hardiness": "Hardiness varies by species.",
    "pruning": "Prune after flowering; timing differs between summer- and winter-flowering jasmine."
  },
  "lilium": {
    "light": "Sun to part shade with roots kept cool",
    "water": "Keep evenly moist in active growth but avoid waterlogging.",
    "soil": "Fertile, well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8
    ],
    "growthHabit": "Bulbous perennial",
    "hardiness": "Many lilies are hardy with good drainage.",
    "pruning": "Remove flower heads after flowering but leave foliage until it yellows.",
    "safety": "Lilies can be extremely dangerous to cats if ingested; keep plants and pollen away from cats."
  },
  "lonicera": {
    "light": "Sun to part shade",
    "water": "Moderate; water during dry spells while establishing.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Climber or shrub",
    "hardiness": "Many honeysuckles are hardy.",
    "pruning": "Pruning depends on flowering time and whether the plant is climbing or shrubby."
  },
  "lupinus": {
    "light": "Full sun",
    "water": "Moderate; avoid waterlogged soil.",
    "soil": "Well-drained soil; many prefer neutral to slightly acidic conditions.",
    "bloomMonths": [
      5,
      6,
      7
    ],
    "growthHabit": "Herbaceous perennial",
    "hardiness": "Hardy in UK gardens with good drainage.",
    "pruning": "Deadhead after flowering for tidiness and possible repeat bloom.",
    "safety": "Seeds and other parts may be harmful if eaten; avoid ingestion."
  },
  "magnolia": {
    "light": "Sun to part shade in a sheltered position",
    "water": "Keep evenly moist while establishing.",
    "soil": "Moist but well-drained, humus-rich soil; many prefer neutral to acidic conditions.",
    "bloomMonths": [
      3,
      4,
      5
    ],
    "growthHabit": "Deciduous or evergreen tree or shrub",
    "hardiness": "Many common magnolias are hardy, but flowers can be frost damaged.",
    "pruning": "Generally needs little pruning; remove damaged or crossing branches after flowering if required."
  },
  "narcissus": {
    "light": "Sun to part shade",
    "water": "Usually needs little extra water in open ground.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      2,
      3,
      4,
      5
    ],
    "growthHabit": "Bulbous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Let foliage die back naturally for several weeks after flowering.",
    "safety": "Bulbs and plant parts are harmful if eaten; avoid ingestion."
  },
  "nepeta": {
    "light": "Full sun",
    "water": "Low to moderate once established.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Aromatic herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut back after the first flush to encourage fresh growth and often more flowers."
  },
  "paeonia": {
    "light": "Full sun to light shade",
    "water": "Moderate; avoid prolonged waterlogging.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      5,
      6
    ],
    "growthHabit": "Herbaceous perennial or deciduous shrub",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Herbaceous peonies are cut down after foliage dies back; tree peonies need only light pruning."
  },
  "pelargonium": {
    "light": "Full sun to bright light",
    "water": "Water when the top of the compost begins to dry; avoid waterlogging.",
    "soil": "Free-draining compost or soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tender perennial often grown as bedding or in containers",
    "hardiness": "Frost tender in the UK.",
    "pruning": "Deadhead regularly and trim back leggy growth."
  },
  "penstemon": {
    "light": "Full sun to part shade",
    "water": "Moderate; avoid winter waterlogging.",
    "soil": "Fertile, free-draining soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Semi-evergreen or herbaceous perennial",
    "hardiness": "Many cultivars are reasonably hardy in sheltered UK gardens.",
    "pruning": "Leave top growth over winter, then cut back in spring when new shoots are visible."
  },
  "petunia": {
    "light": "Full sun",
    "water": "Water regularly, especially in containers.",
    "soil": "Fertile, well-drained compost or soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tender annual or short-lived perennial",
    "hardiness": "Frost tender.",
    "pruning": "Deadhead and trim straggly growth to encourage repeat flowering."
  },
  "phlox": {
    "light": "Full sun to part shade",
    "water": "Moderate; keep taller border types evenly moist.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9
    ],
    "growthHabit": "Herbaceous or evergreen perennial",
    "hardiness": "Many garden phlox are hardy.",
    "pruning": "Deadhead after flowering; cut herbaceous stems down after they die back."
  },
  "pieris": {
    "light": "Part shade with shelter from cold drying winds",
    "water": "Keep evenly moist, especially while establishing.",
    "soil": "Acidic, humus-rich, well-drained soil.",
    "bloomMonths": [
      3,
      4,
      5
    ],
    "growthHabit": "Evergreen shrub",
    "hardiness": "Generally hardy in sheltered UK gardens.",
    "pruning": "Usually needs little pruning; remove damaged growth after flowering."
  },
  "primula": {
    "light": "Part shade to gentle sun",
    "water": "Likes consistent moisture, especially in spring.",
    "soil": "Humus-rich, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      2,
      3,
      4,
      5
    ],
    "growthHabit": "Herbaceous or evergreen perennial",
    "hardiness": "Many primulas are hardy.",
    "pruning": "Deadhead and remove old leaves as needed."
  },
  "rhododendron": {
    "light": "Part shade or dappled light",
    "water": "Keep evenly moist, especially during dry spells.",
    "soil": "Acidic, humus-rich, well-drained soil.",
    "bloomMonths": [
      4,
      5,
      6
    ],
    "growthHabit": "Evergreen or deciduous flowering shrub",
    "hardiness": "Many cultivars are hardy; exposure tolerance varies.",
    "pruning": "Usually needs little pruning; deadhead carefully and shape after flowering if needed.",
    "safety": "Plant parts can be harmful if eaten; avoid ingestion."
  },
  "rudbeckia": {
    "light": "Full sun",
    "water": "Moderate; established plants tolerate short dry spells.",
    "soil": "Fertile, well-drained soil.",
    "bloomMonths": [
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Herbaceous perennial or annual",
    "hardiness": "Many perennial forms are hardy.",
    "pruning": "Deadhead to extend flowering, or leave seed heads for winter interest."
  },
  "salvia": {
    "light": "Full sun",
    "water": "Moderate; many shrubby and Mediterranean types prefer drier conditions once established.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Herbaceous or shrubby perennial",
    "hardiness": "Hardiness varies widely by species and cultivar.",
    "pruning": "Pruning varies by type; many hardy salvias are cut back in spring rather than autumn."
  },
  "sedum": {
    "light": "Full sun",
    "water": "Low once established.",
    "soil": "Free-draining soil.",
    "bloomMonths": [
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Succulent perennial",
    "hardiness": "Many hardy sedums are reliable in UK gardens.",
    "pruning": "Cut old stems in late winter or spring if not left for winter structure."
  },
  "hylotelephium": {
    "light": "Full sun",
    "water": "Low to moderate once established.",
    "soil": "Free-draining soil.",
    "bloomMonths": [
      8,
      9,
      10
    ],
    "growthHabit": "Succulent herbaceous perennial",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Cut old stems in late winter or early spring."
  },
  "skimmia": {
    "light": "Part shade to shade",
    "water": "Moderate; dislikes drying out severely.",
    "soil": "Humus-rich, moist but well-drained, preferably acidic to neutral soil.",
    "bloomMonths": [
      3,
      4,
      5
    ],
    "growthHabit": "Compact evergreen shrub",
    "hardiness": "Hardy in sheltered UK gardens.",
    "pruning": "Usually needs little pruning; lightly shape after flowering if necessary."
  },
  "spiraea": {
    "light": "Full sun to part shade",
    "water": "Moderate while establishing.",
    "soil": "Most fertile, well-drained soils.",
    "bloomMonths": [
      4,
      5,
      6,
      7,
      8
    ],
    "growthHabit": "Deciduous flowering shrub",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Pruning timing depends on whether it flowers on old or new wood."
  },
  "syringa": {
    "light": "Full sun",
    "water": "Moderate; avoid prolonged waterlogging.",
    "soil": "Fertile, well-drained soil, often neutral to alkaline.",
    "bloomMonths": [
      4,
      5,
      6
    ],
    "growthHabit": "Deciduous flowering shrub or small tree",
    "hardiness": "Hardy in UK gardens.",
    "pruning": "Prune immediately after flowering if needed; remove suckers from grafted plants."
  },
  "tulipa": {
    "light": "Full sun",
    "water": "Moderate during active growth; relatively dry during summer dormancy.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      3,
      4,
      5
    ],
    "growthHabit": "Bulbous perennial",
    "hardiness": "Bulbs are generally hardy, but some cultivars perform best when replanted annually.",
    "pruning": "Remove spent flowers but leave foliage until it yellows."
  },
  "verbena": {
    "light": "Full sun",
    "water": "Moderate; drought tolerance varies by type.",
    "soil": "Well-drained soil.",
    "bloomMonths": [
      6,
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Annual or perennial flowering plant",
    "hardiness": "Hardiness varies; Verbena bonariensis often survives in free-draining sheltered sites.",
    "pruning": "Deadhead or cut back after flowering; protect crowns from severe winter wet where marginal."
  },
  "viburnum": {
    "light": "Sun to part shade",
    "water": "Moderate; many prefer soil that does not dry out severely.",
    "soil": "Moist but well-drained soil.",
    "bloomMonths": [
      1,
      2,
      3,
      4,
      5,
      11,
      12
    ],
    "growthHabit": "Evergreen or deciduous shrub",
    "hardiness": "Many garden viburnums are hardy.",
    "pruning": "Prune after flowering if needed; timing varies by species."
  },
  "wisteria": {
    "light": "Full sun for best flowering",
    "water": "Water regularly while establishing and during dry spells.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "bloomMonths": [
      5,
      6,
      7
    ],
    "growthHabit": "Vigorous woody climber",
    "hardiness": "Hardy in many UK gardens.",
    "pruning": "Usually pruned twice yearly: shortening new growth in summer and again in winter."
  },
  "zinnia": {
    "light": "Full sun",
    "water": "Water at the base when needed; avoid keeping foliage constantly wet.",
    "soil": "Fertile, well-drained soil.",
    "bloomMonths": [
      7,
      8,
      9,
      10
    ],
    "growthHabit": "Tender annual",
    "hardiness": "Frost tender.",
    "pruning": "Deadhead regularly to prolong flowering."
  },
  "fatsia": {
    "light": "Part shade to shade; shelter from cold drying winds.",
    "water": "Moderate; keep evenly moist while establishing.",
    "soil": "Fertile, moisture-retentive but well-drained soil.",
    "growthHabit": "Evergreen architectural shrub",
    "hardiness": "Generally hardy in sheltered UK gardens.",
    "pruning": "Remove damaged leaves or reduce overlong stems in spring if needed."
  },
  "monstera": {
    "light": "Bright indirect light",
    "water": "Water when the upper compost has begun to dry; do not leave roots waterlogged.",
    "soil": "Airy, free-draining houseplant compost.",
    "growthHabit": "Evergreen climbing houseplant",
    "hardiness": "Tender; protect from cold.",
    "safety": "Plant sap and tissues can irritate and are harmful if chewed; keep away from pets and young children likely to bite plants."
  },
  "ficus": {
    "light": "Bright indirect light; avoid sudden major changes in position.",
    "water": "Allow the upper compost to dry slightly between waterings.",
    "soil": "Free-draining houseplant compost.",
    "growthHabit": "Evergreen houseplant, shrub or tree",
    "hardiness": "Tender indoors in the UK.",
    "pruning": "Prune lightly in active growth if shaping is needed."
  },
  "dracaena": {
    "light": "Bright indirect light; many tolerate lower light.",
    "water": "Allow the top portion of compost to dry before watering again.",
    "soil": "Free-draining houseplant compost.",
    "growthHabit": "Evergreen cane-forming houseplant",
    "hardiness": "Tender indoors in the UK.",
    "safety": "Some Dracaena species can be harmful to pets if chewed."
  },
  "spathiphyllum": {
    "light": "Bright indirect light to moderate shade",
    "water": "Keep lightly moist but not waterlogged; allow the surface to dry a little between waterings.",
    "soil": "Moisture-retentive but free-draining houseplant compost.",
    "growthHabit": "Evergreen clump-forming houseplant",
    "hardiness": "Tender indoors in the UK.",
    "safety": "Plant tissues can irritate the mouth if chewed; keep away from pets and young children likely to bite plants."
  }
};

function floralensCareMatches(scientificName=""){
  const n=String(scientificName).toLowerCase().trim();
  const exact=FLORALENS_CARE_LIBRARY[n] ? {...FLORALENS_CARE_LIBRARY[n], source:"FloraLens care library · species guidance", matchLevel:"species"} : null;
  const genus=n.split(/\s+/)[0];
  const genusCare=genus && FLORALENS_CARE_LIBRARY[genus]
    ? {...FLORALENS_CARE_LIBRARY[genus], source:"FloraLens care library · genus guidance", matchLevel:"genus"}
    : null;
  return {exact,genus:genusCare};
}

function floralensCareFor(scientificName=""){
  const m=floralensCareMatches(scientificName);
  return m.exact||m.genus||null;
}



function seasonKey(){
  const m=new Date().getMonth()+1;
  if([3,4,5].includes(m)) return "spring";
  if([6,7,8].includes(m)) return "summer";
  if([9,10,11].includes(m)) return "autumn";
  return "winter";
}

function usable(v){
  if(v===null||v===undefined||v==="") return null;
  const s=String(v).trim();
  if(!s) return null;
  if(["not available","care detail not yet available","gathering botanical notes…","gathering botanical notes..."].includes(s.toLowerCase())) return null;
  return v;
}

function perenualHeight(p){
  if(!p || (p.dimensionMin===null && p.dimensionMax===null)) return null;
  const unit=p.dimensionUnit||"";
  if(p.dimensionMin!==null && p.dimensionMax!==null) return `${p.dimensionMin}–${p.dimensionMax} ${unit}`.trim();
  const v=p.dimensionMax ?? p.dimensionMin;
  return `${v} ${unit}`.trim();
}
function perenualSun(p){
  if(!p?.sunlight?.length) return null;
  return p.sunlight.map(x=>String(x).replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase())).join(" · ");
}
function perenualWater(p){
  if(!p) return null;
  if(p.wateringGeneralBenchmark?.value && p.wateringGeneralBenchmark?.unit)
    return `${p.watering || "Water"} · about every ${p.wateringGeneralBenchmark.value} ${p.wateringGeneralBenchmark.unit}`;
  return usable(p.watering);
}
function perenualSoil(p){
  return p?.soil?.length ? p.soil.join(" · ") : null;
}
function perenualHardiness(p){
  if(!p || (p.hardinessMin===null && p.hardinessMax===null)) return null;
  if(p.hardinessMin!==null && p.hardinessMax!==null) return `USDA zones ${p.hardinessMin}–${p.hardinessMax}`;
  return `USDA zone ${p.hardinessMin ?? p.hardinessMax}`;
}
function floweringSeasonMonths(season){
  const s=String(season||"").toLowerCase();
  if(s.includes("spring")) return [3,4,5];
  if(s.includes("summer")) return [6,7,8];
  if(s.includes("autumn")||s.includes("fall")) return [9,10,11];
  if(s.includes("winter")) return [12,1,2];
  return [];
}

function traitRecordFor(scientificName=""){
  const db=window.FLORALENS_TRAITS;
  if(!db) return null;
  const n=String(scientificName).toLowerCase().trim().replace(/\s+/g," ");
  let row=db.species?.[n]; let level="species";
  if(!row){ const genus=n.split(" ")[0]; row=db.genera?.[genus]; level="genus"; }
  if(!row) return null;
  return {growthForm:row[0]||null,woodiness:row[1]||null,succulence:row[2]||null,habitat:row[3]||null,leafType:row[4]||null,heightM:row[5]??null,matchLevel:level};
}
function prettyTrait(v){ return usable(v)?String(v).replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase()):null; }
function traitHeight(tr){
  if(!tr?.heightM) return null;
  const h=Number(tr.heightM); if(!Number.isFinite(h)||h<=0) return null;
  if(h<1) return `Typical TRY vegetative height about ${Math.round(h*100)} cm`;
  return `Typical TRY vegetative height about ${h.toFixed(h<10?1:0)} m`;
}
function traitCareInference(tr){
  if(!tr) return {};
  const gf=String(tr.growthForm||"").toLowerCase(), succ=String(tr.succulence||"").toLowerCase(), hab=String(tr.habitat||"").toLowerCase();
  let water=null,soil=null;
  if(hab.includes("aquatic")){ water="Moisture-loving / aquatic growth strategy indicated by TRY traits."; soil="Keep consistently wet or aquatic as appropriate to the identified species."; }
  else if(succ){ water="Succulent growth suggests conservative watering; let the growing medium drain well between waterings."; soil="A free-draining growing medium is a sensible starting point for this succulent growth form."; }
  else if(gf.includes("fern")){ water="Fern growth form generally points to avoiding prolonged drought; exact moisture needs vary by species."; soil="Moisture-retentive but aerated organic soil is a cautious starting point; verify species-specific needs."; }
  else if(gf.includes("tree")||gf.includes("shrub")){ water="Water regularly while establishing; established requirements depend on species and site."; soil="Well-drained garden soil is a general starting point; acidity and fertility remain species-specific."; }
  else if(gf.includes("herbaceous")){ water="Moderate, even moisture during active growth is a general starting point; adjust for the species and weather."; soil="A reasonably fertile, well-drained garden soil suits many herbaceous plants; verify species-specific exceptions."; }
  return {water,soil};
}
function resolvedCare(scientificName,t,pn){
  const tr=traitRecordFor(scientificName);
  const inferred=traitCareInference(tr);
  const localMatches=floralensCareMatches(scientificName);
  const exactLocal=localMatches.exact;
  const genusLocal=localMatches.genus;
  const local=exactLocal||genusLocal;
  const trefleSoil = t ? usable(soilLabel(t)) : null;

  const pCare={
    light: usable(perenualSun(pn)),
    water: usable(perenualWater(pn)),
    soil: usable(perenualSoil(pn)),
    height: usable(perenualHeight(pn)),
    bloomMonths: floweringSeasonMonths(pn?.floweringSeason),
    growthHabit: usable(pn?.type),
    growthRate: usable(pn?.growthRate),
    hardiness: usable(perenualHardiness(pn)),
    safety: pn?.poisonousToHumans===true || pn?.poisonousToPets===true
      ? `Recorded as poisonous${pn.poisonousToHumans===true?" to humans":""}${pn.poisonousToHumans===true&&pn.poisonousToPets===true?" and":""}${pn.poisonousToPets===true?" to pets":""}.`
      : null
  };

  const tCare={
    light: t?.light!==null && t?.light!==undefined ? usable(lightLabel(t.light)) : null,
    water: t?.soilHumidity!==null && t?.soilHumidity!==undefined ? usable(moistureLabel(t.soilHumidity)) : null,
    soil: trefleSoil,
    height: t && (t.averageHeightCm||t.maximumHeightCm) ? usable(formatHeight(t.averageHeightCm,t.maximumHeightCm)) : null,
    bloomMonths: t?.bloomMonths?.length ? monthsToNumbers(t.bloomMonths) : [],
    growthHabit: usable(t?.growthHabit),
    growthRate: usable(t?.growthRate),
    hardiness: t?.minimumTemperatureC!==null && t?.minimumTemperatureC!==undefined ? `Recorded minimum temperature ${t.minimumTemperatureC}°C` : null,
    safety: toxicityCopy(t)
  };

  const traitFields={
    water:usable(inferred.water), soil:usable(inferred.soil), height:usable(traitHeight(tr)),
    growthHabit:usable(prettyTrait(tr?.growthForm))
  };
  const pick=(k)=>usable(exactLocal?.[k]) || usable(pCare[k]) || usable(tCare[k]) || usable(genusLocal?.[k]) || usable(traitFields[k]) || null;
  const bloom = exactLocal?.bloomMonths?.length ? exactLocal.bloomMonths :
                pCare.bloomMonths?.length ? pCare.bloomMonths :
                tCare.bloomMonths?.length ? tCare.bloomMonths :
                genusLocal?.bloomMonths || [];

  return {
    light:pick("light"), water:pick("water"), soil:pick("soil"), height:pick("height"),
    bloomMonths:bloom,
    growthHabit:pick("growthHabit"), growthRate:pick("growthRate"),
    pruning:usable(exactLocal?.pruning)||usable(genusLocal?.pruning),
    propagation:usable(exactLocal?.propagation)||usable(genusLocal?.propagation),
    hardiness:pick("hardiness"),
    safety:usable(exactLocal?.safety)||pCare.safety||tCare.safety||usable(genusLocal?.safety),
    seasonal:exactLocal?.seasonal||genusLocal?.seasonal||null,
    localSource:local?.source||null,
    localMatchLevel:local?.matchLevel||null,
    usedPerenual:!!pn && Object.values(pCare).some(v=>Array.isArray(v)?v.length:!!v),
    usedTrefle:!!t && Object.values(tCare).some(v=>Array.isArray(v)?v.length:!!v),
    usedLocal:!!local,
    usedTraits:!!tr, traitMatchLevel:tr?.matchLevel||null,
    traitWoodiness:prettyTrait(tr?.woodiness), traitLeafType:prettyTrait(tr?.leafType), traitHabitat:prettyTrait(tr?.habitat), traitSucculence:prettyTrait(tr?.succulence)
  };
}


const defaultState = {
  plants: [
    {id:"rose",speciesKey:"rosa-gertrude-jekyll",common:"Gertrude Jekyll",scientific:"Rosa 'Gertrude Jekyll'",family:"Rosaceae",area:"Back border",status:"Flowering",art:"rose",added:"2026-06-14",notes:"Deep pink, strongly fragrant blooms.",sun:"Full sun",water:"Moderate",soil:"Moist, well-drained",height:"1.2–1.5 m",bloom:[5,6,7,8,9]},
    {id:"lavender",speciesKey:"lavandula-angustifolia",common:"English Lavender",scientific:"Lavandula angustifolia",family:"Lamiaceae",area:"Patio",status:"Flowering",art:"lavender",added:"2026-07-02",notes:"Aromatic evergreen perennial loved by pollinators.",sun:"Full sun",water:"Low",soil:"Free-draining",height:"0.4–0.7 m",bloom:[6,7,8,9]},
    {id:"hydrangea",speciesKey:"hydrangea-macrophylla",common:"Hydrangea",scientific:"Hydrangea macrophylla",family:"Hydrangeaceae",area:"Side border",status:"Flowering",art:"hydrangea",added:"2026-05-28",notes:"Large rounded flower heads with lush foliage.",sun:"Part shade",water:"Regular",soil:"Moist, fertile",height:"1–2 m",bloom:[7,8,9]}
  ],
  speciesCache: {
    "lavandula-angustifolia": {scientific:"Lavandula angustifolia", common:"English Lavender", family:"Lamiaceae", source:"starter", fetchedAt:"2026-09-06"}
  },
  areas:["Front Garden","Back Garden","Patio","Indoors","Greenhouse","Unplaced"],
  journal: [],
  discoveries: [],
  lastQuota: null
};

let state = loadState();
let currentRoute = "home";
let captures = []; // [{id,file,dataUrl,organ}]
let pendingResults = null;
let chosenArea = "Unplaced";
let captureIntent = "identify"; // identify | discover

function loadState(){
  try {
    const old = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const merged = {...structuredClone(defaultState), ...old};
    merged.speciesCache = {...defaultState.speciesCache, ...(old.speciesCache||{})};
    merged.areas = old.areas?.length ? old.areas : defaultState.areas;
    merged.discoveries = Array.isArray(old.discoveries) ? old.discoveries : [];
    merged.journal = Array.isArray(old.journal) ? old.journal : [];
    return merged;
  } catch { return structuredClone(defaultState); }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(s=""){ return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
function slug(s=""){ return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-"); }
function toast(msg){ document.body.insertAdjacentHTML("beforeend",`<div class="toast" id="toast">${esc(msg)}</div>`); setTimeout(()=>document.getElementById("toast")?.remove(),2200); }

function photoDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(PHOTO_DB,1);
    req.onupgradeneeded=()=>{ if(!req.result.objectStoreNames.contains(PHOTO_STORE)) req.result.createObjectStore(PHOTO_STORE); };
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}
async function savePhoto(key, blob){
  const db=await photoDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(PHOTO_STORE,"readwrite");
    tx.objectStore(PHOTO_STORE).put(blob,key);
    tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);
  });
}
async function getPhotoUrl(key){
  if(!key) return null;
  try{
    const db=await photoDB();
    const blob=await new Promise((resolve,reject)=>{
      const tx=db.transaction(PHOTO_STORE,"readonly");
      const req=tx.objectStore(PHOTO_STORE).get(key);
      req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
    });
    return blob ? URL.createObjectURL(blob) : null;
  }catch{return null}
}

async function deletePhoto(key){
  if(!key) return;
  try{
    const db=await photoDB();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(PHOTO_STORE,"readwrite");
      tx.objectStore(PHOTO_STORE).delete(key);
      tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error);
    });
  }catch(e){ console.warn("Photo delete failed",e); }
}

function setRoute(route, data={}){
  currentRoute=route;
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.route===route));
  if(route==="home") renderHome();
  if(route==="garden") renderGarden();
  if(route==="lens") renderLens();
  if(route==="journal") renderJournal();
  if(route==="discover") renderDiscover();
  if(route==="profile" && data.id) renderProfile(data.id);
  window.scrollTo({top:0,behavior:"smooth"});
}

function pin(p,{canDelete=false}={}){
  return `<article class="pin" onclick="if(!event.target.closest('.pin-delete')) setRoute('profile',{id:'${p.id}'})">
    <div class="plant-art ${p.art||""}" data-photo-key="${esc(p.photoKey||"")}"></div>
    ${canDelete?`<button class="pin-delete" aria-label="Delete ${esc(p.common)}" title="Delete" onclick="event.stopPropagation();confirmDeletePlant('${p.id}')">×</button>`:""}
    <div class="pin-body"><b>${esc(p.common)}</b><small><i>${esc(p.scientific)}</i></small><br><span class="chip">✿ ${esc(p.status||p.area||"Saved")}</span></div>
  </article>`;
}
async function hydratePhotos(scope=document){
  const nodes=[...scope.querySelectorAll("[data-photo-key]")].filter(n=>n.dataset.photoKey);
  for(const n of nodes){
    const url=await getPhotoUrl(n.dataset.photoKey);
    if(url){ n.style.backgroundImage=`url("${url}")`; n.style.backgroundSize="cover"; n.style.backgroundPosition="center"; }
  }
}

function renderHome(){
  const flowering=state.plants.filter(p=>p.status==="Flowering").length;
  view.innerHTML=`
    <section class="hero"><div class="eyebrow">Your botanical scrapbook</div><h1>Your little world<br>in bloom.</h1><p class="sub">Keep every flower, story and small garden discovery in one beautiful place.</p><div class="hero-bloom">❀</div></section>
    <button class="lens-banner" onclick="startCamera()"><span class="lens-icon">⌾</span><span><strong>Identify something beautiful</strong><small>One photo is enough. Add up to five when a plant is tricky.</small></span></button>
    <div class="stats-strip"><div class="stat"><b>${state.plants.length}</b><small>in your garden</small></div><div class="stat"><b>${flowering}</b><small>flowering now</small></div><div class="stat"><b>${state.discoveries.length}</b><small>discoveries</small></div></div>
    <div class="section-title"><h3>From your garden</h3><button class="link-btn" onclick="setRoute('garden')">See all</button></div>
    <section class="masonry">${state.plants.map(p=>pin(p,{canDelete:true})).join("")}</section>
    <div class="section-title"><h3>FloraLens memory</h3></div>
    <div class="note-card"><div class="eyebrow">Species cache</div><h2 style="font-size:25px;margin-top:6px">${Object.keys(state.speciesCache).length} plant types remembered</h2><p class="sub" style="margin-bottom:0">Once FloraLens has enriched a species, future plants of the same species can reuse that botanical record.</p></div>`;
  hydratePhotos();
}

function renderGarden(){
  view.innerHTML=`<section class="page-head"><div class="eyebrow">My collection</div><h1>My Garden</h1><p class="sub">${state.plants.length} plants, each with its own little story.</p></section>
    <input class="search" id="gardenSearch" placeholder="Search your plants…" oninput="filterGarden(this.value)">
    <div class="toolbar">${["All",...state.areas].map((a,i)=>`<button class="filter ${i===0?"active":""}" onclick="filterByArea('${esc(a)}',this)">${esc(a)}</button>`).join("")}</div>
    <section class="masonry" id="gardenPins">${state.plants.map(pin).join("")}</section>`;
  hydratePhotos();
}
function filterGarden(q){
  const list=state.plants.filter(p=>(p.common+p.scientific+p.area).toLowerCase().includes(q.toLowerCase()));
  gardenPins.innerHTML=list.map(pin).join("") || `<div class="empty-card">No plants matched that search.</div>`;
  hydratePhotos(gardenPins);
}
function filterByArea(area,btn){
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
  const list=area==="All"?state.plants:state.plants.filter(p=>p.area===area);
  gardenPins.innerHTML=list.map(pin).join("") || `<div class="empty-card">Nothing saved in ${esc(area)} yet.</div>`;
  hydratePhotos(gardenPins);
}

function startCamera(intent="identify"){
  captures=[];
  pendingResults=null;
  captureIntent=intent;
  window.captureOrgan="auto";
  // Called directly from a user tap so iOS opens the rear camera immediately.
  cameraInput.click();
}

function renderLens(){
  captures=[];
  pendingResults=null;
  view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens</div><h1>What did you find?</h1>${state.lastQuota!==null?`<span class="quota-pill">❧ ${state.lastQuota} identifications left today</span>`:""}</section>
    <section class="lens-screen"><div class="camera-stage" id="cameraStage"><div class="camera-copy"><h2>Point at a flower or plant</h2><p>Start with the clearest view. FloraLens can combine several views of the same plant.</p></div><div class="focus-corners"></div>
      <div class="camera-controls"><button class="mini-cam" onclick="galleryInput.click()">▧</button><button class="capture" onclick="beginCapture('auto')"></button><button class="mini-cam" onclick="showLensTips()">?</button></div></div></section>`;
}
function beginCapture(organ="auto"){ window.captureOrgan=organ; multiPhotoInput.click(); }

async function addCapture(file, organ="auto"){
  if(!file || captures.length>=5) return;
  if(!["image/jpeg","image/png"].includes(file.type)){ toast("Use a JPG or PNG photo."); return; }
  const dataUrl=await fileToDataUrl(file);
  captures.push({id:crypto.randomUUID?.()||String(Date.now()+Math.random()),file,dataUrl,organ});
  renderCaptureReview();
}
function fileToDataUrl(file){ return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);}); }

function renderCaptureReview(){
  view.innerHTML=`<section class="page-head"><div class="eyebrow">Closer look</div><h1>${captures.length===1?"Lovely shot.":"More clues."}</h1><p class="sub">Label each view if you know the plant part, or leave it on Auto.</p></section>
    <div class="capture-stack">${captures.map((c,i)=>`<div class="capture-card"><button class="capture-remove" onclick="removeCapture(${i})">×</button><img src="${c.dataUrl}"><span class="organ">${esc(c.organ)}</span></div>`).join("")}${captures.length<5?`<button class="add-capture" onclick="chooseOrganForNext()">＋<br>Add view</button>`:""}</div>
    <div class="result-hero" style="min-height:330px"><img class="preview-img" src="${captures[0].dataUrl}"><div class="result-gradient"></div><div class="result-copy"><div class="eyebrow" style="color:white">${captures.length} of 5 photos</div><h1>Ready to identify?</h1><span class="confidence">${captures.map(c=>c.organ).join(" · ")}</span></div></div>
    <div class="actions"><button class="btn primary" onclick="identifyPlant()">✿ Identify plant</button><button class="btn secondary" onclick="chooseOrganForNext()" ${captures.length>=5?"disabled":""}>＋ Another view</button></div>
    <button class="btn outline" style="width:100%" onclick="startCamera(captureIntent)">Start again</button>
    ${!API_PROXY_URL?`<div class="setup-card"><div class="eyebrow">Demo mode</div><p class="sub" style="margin:6px 0 0">The complete flow works now. Deploy the included free Cloudflare Worker and set <code>API_PROXY_URL</code> to switch on real Pl@ntNet results.</p></div>`:""}`;
}
function removeCapture(i){ captures.splice(i,1); captures.length?renderCaptureReview():startCamera(captureIntent); }
function chooseOrganForNext(){
  if(captures.length>=5) return;
  modal(`<div class="eyebrow">Add another view</div><h2>What will you photograph?</h2><div class="organ-grid">
    <button class="organ-choice" onclick="pickOrgan('flower')"><span>✿</span>Flower</button>
    <button class="organ-choice" onclick="pickOrgan('leaf')"><span>❧</span>Leaf</button>
    <button class="organ-choice" onclick="pickOrgan('fruit')"><span>●</span>Fruit</button>
    <button class="organ-choice" onclick="pickOrgan('bark')"><span>♜</span>Bark</button>
    <button class="organ-choice" onclick="pickOrgan('auto')"><span>⌾</span>Auto</button>
  </div><p class="small">All photos in one identification should be of the same individual plant.</p>`);
}
function pickOrgan(o){ closeModal(); beginCapture(o); }

async function identifyPlant(){
  if(!captures.length) return;
  const first=captures[0].dataUrl;
  view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens</div><h1>Looking closely…</h1></section><div class="result-hero"><img class="preview-img" src="${first}"><div class="identify-overlay"><div><div class="flower-loader">✿</div><h2 style="margin:12px 0 5px">Comparing the details</h2><p style="opacity:.8">${captures.length} ${captures.length===1?"view":"views"} of the same plant.</p></div></div></div>`;
  try{
    if(API_PROXY_URL){
      const fd=new FormData();
      captures.forEach(c=>{ fd.append("images",c.file,c.file.name||"plant.jpg"); fd.append("organs",c.organ); });
      fd.append("lang","en");
      fd.append("nb-results","5");
      const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/identify`,{method:"POST",body:fd});
      if(!res.ok) throw new Error(`Identification failed (${res.status})`);
      const data=await res.json();
      pendingResults=data.results||[];
      if(Number.isFinite(data.remainingIdentificationRequests)){state.lastQuota=data.remainingIdentificationRequests;saveState();}
    } else {
      await new Promise(r=>setTimeout(r,1150));
      pendingResults=[
        {score:.963,species:{scientificNameWithoutAuthor:"Lavandula angustifolia",family:{scientificNameWithoutAuthor:"Lamiaceae"},genus:{scientificNameWithoutAuthor:"Lavandula"},commonNames:["English Lavender","True Lavender"]}},
        {score:.742,species:{scientificNameWithoutAuthor:"Lavandula latifolia",family:{scientificNameWithoutAuthor:"Lamiaceae"},genus:{scientificNameWithoutAuthor:"Lavandula"},commonNames:["Spike Lavender"]}},
        {score:.516,species:{scientificNameWithoutAuthor:"Lavandula × intermedia",family:{scientificNameWithoutAuthor:"Lamiaceae"},genus:{scientificNameWithoutAuthor:"Lavandula"},commonNames:["Lavandin"]}}
      ];
    }
    if(!pendingResults.length) throw new Error("No plant match was returned");
    renderResult();
  }catch(err){
    view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens</div><h1>Couldn’t settle on a match</h1><p class="sub">${esc(err.message)}</p></section><button class="btn primary" style="width:100%" onclick="renderCaptureReview()">Try these photos again</button>`;
  }
}

function resultInfo(r){
  const s=r?.species||{};
  return {common:s.commonNames?.[0]||s.scientificNameWithoutAuthor||"Possible match", sci:s.scientificNameWithoutAuthor||"", family:s.family?.scientificNameWithoutAuthor||"Plant", genus:s.genus?.scientificNameWithoutAuthor||""};
}
function renderResult(){
  const r=pendingResults[0], info=resultInfo(r);
  view.innerHTML=`<section class="page-head"><div class="eyebrow">FloraLens match</div><h1>I think I found it!</h1>${state.lastQuota!==null?`<span class="quota-pill">❧ ${state.lastQuota} identifications left today</span>`:""}</section>
    <div class="result-hero"><img class="preview-img" src="${captures[0].dataUrl}"><div class="result-gradient"></div><div class="result-copy"><div class="eyebrow" style="color:white">${esc(info.family)}</div><h1>${esc(info.common)}</h1><em>${esc(info.sci)}</em><br><span class="confidence">${Math.round(r.score*100)}% match</span></div></div>
    <div class="actions">
      ${captureIntent==="discover"
        ? `<button class="btn primary" onclick="saveDiscovery()">♡ Save to Discover</button><button class="btn secondary" onclick="chooseSaveArea()">Add to Garden</button>`
        : `<button class="btn primary" onclick="chooseDestination()">✓ That’s it</button><button class="btn secondary" onclick="showMatches()">Other matches</button>`}
    </div>
    ${captureIntent==="discover"?`<button class="link-btn" style="width:100%;margin:8px 0 2px" onclick="finishWithoutSaving()">Just looking — don't save</button>`:""}
    <div class="profile-card"><div class="eyebrow">Identification evidence</div><h2 style="font-size:25px;margin-top:7px">${captures.length} ${captures.length===1?"photo":"photos"} considered</h2><div class="photo-strip">${captures.map(c=>`<div><img class="thumb" src="${c.dataUrl}"><div class="small" style="text-align:center">${esc(c.organ)}</div></div>`).join("")}</div><p class="small">Confidence is Pl@ntNet's ranked identification score, not a guarantee. Confirming the visual match keeps FloraLens's garden records cleaner.</p></div>`;
}
function showMatches(){
  modal(`<div class="eyebrow">Possible matches</div><h2>What looks right?</h2>${pendingResults.slice(0,5).map((r,i)=>{const x=resultInfo(r);return `<button class="match-card" onclick="selectMatch(${i})"><span><b>${esc(x.common)}</b><br><small><i>${esc(x.sci)}</i> · ${esc(x.family)}</small></span><span class="match-score">${Math.round(r.score*100)}%</span></button>`}).join("")}`);
}
function selectMatch(i){ pendingResults=[pendingResults[i],...pendingResults.filter((_,x)=>x!==i)]; closeModal(); renderResult(); }

function chooseDestination(){
  modal(`<div class="eyebrow">Keep this one?</div><h2>Where should it go?</h2>
    <button class="destination-choice" onclick="closeModal();chooseSaveArea()"><span>⌂</span><div><b>Add to My Garden</b><small>A plant you own — choose its area and keep a care record.</small></div></button>
    <button class="destination-choice" onclick="closeModal();saveDiscovery()"><span>♡</span><div><b>Save to Discover</b><small>Something you spotted, liked or might buy later.</small></div></button>
    <button class="link-btn" style="width:100%;margin-top:14px" onclick="finishWithoutSaving()">Just looking — don't save</button>`);
}

function finishWithoutSaving(){
  closeModal();
  captures=[];
  pendingResults=null;
  toast("Identification complete");
  setRoute(captureIntent==="discover"?"discover":"home");
}

function chooseSaveArea(){
  chosenArea="Unplaced";
  modal(`<div class="eyebrow">Add to My Garden</div><h2>Where does it live?</h2><div class="area-grid">${state.areas.map(a=>`<button class="area-choice ${a===chosenArea?"active":""}" onclick="selectArea('${esc(a)}',this)">${esc(a)}</button>`).join("")}</div><button class="btn primary" style="width:100%" onclick="confirmPlant()">Save this plant</button><button class="link-btn" style="width:100%;margin-top:12px" onclick="addAreaPrompt()">＋ Create an area</button>`);
}
function selectArea(a,btn){ chosenArea=a; document.querySelectorAll(".area-choice").forEach(x=>x.classList.remove("active"));btn.classList.add("active"); }
function addAreaPrompt(){
  closeModal();
  modal(`<div class="eyebrow">Garden areas</div><h2>Create a new area</h2><input id="newArea" class="search" placeholder="e.g. Rose bed"><button class="btn primary" style="width:100%" onclick="saveNewArea()">Add area</button>`);
}
function saveNewArea(){ const a=document.getElementById("newArea").value.trim();if(!a)return;if(!state.areas.includes(a))state.areas.push(a);saveState();chosenArea=a;closeModal();chooseSaveArea(); }

async function saveDiscovery(){
  const r=pendingResults?.[0];
  if(!r) return;
  const x=resultInfo(r);
  const speciesKey=slug(x.sci);
  if(!state.speciesCache[speciesKey]){
    state.speciesCache[speciesKey]={
      scientific:x.sci,common:x.common,family:x.family,genus:x.genus,
      source:"Pl@ntNet identification",fetchedAt:new Date().toISOString(),enrichment:null
    };
  }

  const id="discovery-"+Date.now();
  const photoKey=`${id}-hero`;
  try{ await savePhoto(photoKey,captures[0].file); }catch(e){ console.warn("Discovery photo storage failed",e); }

  state.discoveries.unshift({
    id, speciesKey, photoKey,
    common:x.common, scientific:x.sci, family:x.family,
    score:Math.round((r.score||0)*100),
    spotted:new Date().toISOString(),
    wishlist:false,
    note:""
  });
  saveState();
  captures=[];
  pendingResults=null;
  toast(`${x.common} saved to Discover`);

  // Enrich once so its Discover detail page has the same knowledge as Garden plants.
  if(!state.speciesCache[speciesKey]?.enrichment){
    enrichSpecies(x.sci,speciesKey).catch(()=>{});
  }
  setRoute("discover");
}

function confirmDeleteDiscovery(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  modal(`<div class="eyebrow">Remove discovery</div><h2>Forget ${esc(d.common)}?</h2>
    <p class="sub">This removes the saved discovery and its photo from this device. Your reusable species knowledge stays cached.</p>
    <div class="actions"><button class="btn secondary" onclick="closeModal()">Keep it</button><button class="btn danger" onclick="deleteDiscovery('${id}')">Delete</button></div>`);
}

async function deleteDiscovery(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  state.discoveries=state.discoveries.filter(x=>x.id!==id);
  saveState();
  closeModal();
  await deletePhoto(d.photoKey);
  toast("Discovery removed");
  renderDiscover();
}

function addDiscoveryToGarden(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  chosenArea="Unplaced";
  modal(`<div class="eyebrow">Bring it home</div><h2>Add ${esc(d.common)} to My Garden?</h2>
    <p class="sub">Choose where it lives. The original discovery can stay in Discover as part of the story.</p>
    <div class="area-grid">${state.areas.map(a=>`<button class="area-choice ${a===chosenArea?"active":""}" onclick="selectArea('${esc(a)}',this)">${esc(a)}</button>`).join("")}</div>
    <button class="btn primary" style="width:100%" onclick="confirmDiscoveryToGarden('${id}')">Add to garden</button>`);
}

async function confirmDiscoveryToGarden(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  const cached=state.speciesCache[d.speciesKey]||{};
  const newId="plant-"+Date.now();
  const newPhotoKey=`${newId}-hero`;
  const oldUrl=await getPhotoUrl(d.photoKey);
  if(oldUrl){
    try{
      const blob=await fetch(oldUrl).then(r=>r.blob());
      await savePhoto(newPhotoKey,blob);
      URL.revokeObjectURL(oldUrl);
    }catch(e){ console.warn("Could not copy discovery photo",e); }
  }
  state.plants.unshift({
    id:newId,speciesKey:d.speciesKey,photoKey:newPhotoKey,
    common:d.common,scientific:d.scientific,family:d.family,
    area:chosenArea,status:"New",added:new Date().toISOString().slice(0,10),
    notes:cached.notes||"First spotted in Discover.",
    sun:cached.sun||"Gathering botanical notes…",
    water:cached.water||"Gathering botanical notes…",
    soil:cached.soil||"Gathering botanical notes…",
    height:cached.height||"Gathering botanical notes…",
    bloom:cached.bloom||[]
  });
  saveState();
  closeModal();
  toast(`${d.common} added to ${chosenArea}`);
  setRoute("garden");
}

function toggleWishlist(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  d.wishlist=!d.wishlist;
  saveState();
  renderDiscover();
  toast(d.wishlist?"Added to wishlist":"Removed from wishlist");
}

function toggleWishlistFromProfile(id){
  const d=state.discoveries.find(x=>x.id===id);
  if(!d) return;
  d.wishlist=!d.wishlist;
  saveState();
  toast(d.wishlist?"Added to wishlist":"Removed from wishlist");
  renderProfile(id);
}


async function enrichSpecies(scientificName, speciesKey, force=false){
  const cached=state.speciesCache[speciesKey]||{};
  if(!force && cached.enrichment?.fetchedAt) return cached.enrichment;
  try{
    const res=await fetch(`${API_PROXY_URL.replace(/\/$/,"")}/enrich?name=${encodeURIComponent(scientificName)}`);
    if(!res.ok) throw new Error(`Botanical notes failed (${res.status})`);
    const data=await res.json();
    const enrichment={...data,fetchedAt:new Date().toISOString()};
    state.speciesCache[speciesKey]={...cached,enrichment,source:[...(data.sources||[]),"Pl@ntNet"].join(" + "),fetchedAt:new Date().toISOString()};
    saveState();
    syncPlantsFromSpecies(speciesKey);
    return enrichment;
  }catch(err){
    console.warn("Enrichment failed",err);
    state.speciesCache[speciesKey]={...cached,enrichmentError:String(err.message||err)};
    saveState();
    return null;
  }
}

function syncPlantsFromSpecies(speciesKey){
  const cache=state.speciesCache[speciesKey];
  if(!cache) return;
  const intel=cache.enrichment||{};
  state.plants.filter(p=>p.speciesKey===speciesKey).forEach(p=>{
    const care=resolvedCare(p.scientific,intel.trefle||null,intel.perenual||null);
    if(care.bloomMonths?.length) p.bloom=care.bloomMonths;
    if(care.height) p.height=care.height;
    if(care.light) p.sun=care.light;
    if(care.water) p.water=care.water;
    if(care.soil) p.soil=care.soil;
    const desc=intel.perenual?.description||intel.trefle?.growthDescription||intel.trefle?.observations;
    if(desc) p.notes=desc;
  });
  saveState();
}

async function confirmPlant(){
  const r=pendingResults[0], x=resultInfo(r);
  const speciesKey=slug(x.sci);
  if(!state.speciesCache[speciesKey]){
    state.speciesCache[speciesKey]={scientific:x.sci,common:x.common,family:x.family,genus:x.genus,source:"Pl@ntNet identification",fetchedAt:new Date().toISOString(),enrichment:null};
  }
  const id="plant-"+Date.now(), photoKey=`${id}-hero`;
  try{ await savePhoto(photoKey,captures[0].file); }catch(e){ console.warn("Photo storage failed",e); }
  const cached=state.speciesCache[speciesKey]||{};
  state.plants.unshift({id,speciesKey,photoKey,common:x.common,scientific:x.sci,family:x.family,area:chosenArea,status:"New",added:new Date().toISOString().slice(0,10),notes:cached.notes||"Newly identified with FloraLens.",sun:cached.sun||"Gathering botanical notes…",water:cached.water||"Gathering botanical notes…",soil:cached.soil||"Gathering botanical notes…",height:cached.height||"Gathering botanical notes…",bloom:cached.bloom||[]});
  saveState(); closeModal(); captures=[]; toast(`${x.common} saved to ${chosenArea}`);
  await renderProfile(id,true);
  const existing=state.speciesCache[speciesKey]?.enrichment;
  if(!existing){
    const intel=await enrichSpecies(x.sci,speciesKey);
    if(intel){ toast("Botanical notes added"); await renderProfile(id,false); }
  }
}

function monthsToNumbers(months=[]){
  const map={jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,september:9,sept:9,oct:10,october:10,nov:11,november:11,dec:12,december:12};
  return months.map(m=>map[String(m).toLowerCase()]).filter(Boolean);
}
function formatHeight(avg,max){
  const vals=[avg,max].filter(v=>typeof v==="number"&&v>0);
  if(!vals.length)return "Not available";
  if(vals.length===1)return vals[0]>=100?`${(vals[0]/100).toFixed(vals[0]%100?1:0)} m`:`${Math.round(vals[0])} cm`;
  const a=vals[0]>=100?`${(vals[0]/100).toFixed(1)} m`:`${Math.round(vals[0])} cm`;
  const b=vals[1]>=100?`${(vals[1]/100).toFixed(1)} m`:`${Math.round(vals[1])} cm`;
  return `${a} avg · ${b} max`;
}
function lightLabel(v){ if(v===null||v===undefined)return "Not available"; if(v>=8)return "Full sun"; if(v>=5)return "Sun to part shade"; if(v>=3)return "Part shade"; return "Shade / low light"; }
function moistureLabel(v){ if(v===null||v===undefined)return "Not available"; if(v<=2)return "Dry / drought-tolerant"; if(v<=4)return "Allow some drying"; if(v<=7)return "Even moisture"; return "Moist to wet"; }
function soilLabel(t){
  const bits=[];
  if(t.phMinimum!==null||t.phMaximum!==null){
    const lo=t.phMinimum??"—", hi=t.phMaximum??"—"; bits.push(`pH ${lo}–${hi}`);
  }
  if(t.soilTexture!==null){
    bits.push(t.soilTexture<=3?"Finer / clay-leaning":t.soilTexture>=7?"Coarser / free-draining":"Balanced texture");
  }
  return bits.join(" · ")||"Not available";
}
function toxicityCopy(t){
  if(!t || !t.toxicity) return null;
  const level=String(t.toxicity).toLowerCase();
  if(level==="none") return "Trefle records no known toxicity in its plant specification.";
  return `Trefle records ${level} relative toxicity. Treat this as a caution flag, not medical or veterinary advice.`;
}
function currentSeasonNote(t,p){
  const month=new Date().getMonth()+1;
  const bloom=monthsToNumbers(t?.bloomMonths||p.bloom||[]);
  const growth=monthsToNumbers(t?.growthMonths||[]);
  if(bloom.includes(month)) return {title:"In its flowering window",text:"This species is recorded as typically blooming around this time of year."};
  if(growth.includes(month)) return {title:"Active growth time",text:"This month falls within the species' recorded active-growth period."};
  if(bloom.length){
    const next=bloom.find(m=>m>month)||bloom[0];
    const names=["","January","February","March","April","May","June","July","August","September","October","November","December"];
    return {title:"Between flowering periods",text:`Its recorded flowering window next includes ${names[next]}.`};
  }
  return {title:"A quieter botanical note",text:"There isn't enough seasonal data yet to give this plant a reliable month-by-month status."};
}
function dataCoverage(t,g){
  const vals=[t?.light,t?.soilHumidity,t?.phMinimum,t?.phMaximum,t?.averageHeightCm,t?.maximumHeightCm,t?.bloomMonths?.length,t?.growthHabit,g?.family,g?.rank];
  const present=vals.filter(v=>v!==null&&v!==undefined&&v!==""&&v!==0).length;
  return Math.round((present/vals.length)*100);
}

async function refreshIntel(id){
  const p=state.plants.find(x=>x.id===id) || state.discoveries.find(x=>x.id===id);
  if(!p) return;
  toast("Refreshing botanical notes…");
  const intel=await enrichSpecies(p.scientific,p.speciesKey,true);
  if(intel){ toast("Botanical notes refreshed"); renderProfile(id); }
  else toast("Couldn’t refresh botanical notes");
}

async function renderProfile(id,isNew=false){
  currentRoute="profile";
  const gardenPlant=state.plants.find(x=>x.id===id);
  const discovery=state.discoveries.find(x=>x.id===id);
  const p=gardenPlant||discovery;
  const isDiscovery=!!discovery&&!gardenPlant;
  if(!p) return setRoute("home");
  const cached=state.speciesCache[p.speciesKey]||{};
  const intel=cached.enrichment||null;
  const t=intel?.trefle||null;
  const pn=intel?.perenual||null;
  const g=intel?.gbif||null;
  const care=resolvedCare(p.scientific,t,pn);
  const sourceNames=[...(intel?.sources||[])];
  if(care.localSource && !sourceNames.includes(care.localSource)) sourceNames.push(care.localSource);
  if(care.usedTraits) sourceNames.push(`TRY traits · ${care.traitMatchLevel}`);
  const bloom=care.bloomMonths?.length?care.bloomMonths:(p.bloom||[]);
  const desc=pn?.description||t?.growthDescription||t?.observations||g?.descriptions?.find(d=>d.description)?.description||p.notes;
  const currentSeason=seasonKey();
  const seasonalLocal=care.seasonal?.[currentSeason]||null;
  const taxonConfirmed=!!(g||t);
  const careAvailable=[care.light,care.water,care.soil,care.height,care.growthHabit,care.pruning,care.hardiness].filter(Boolean).length;
  const careCoverage=Math.round((careAvailable/7)*100);

  let intelTitle="Gathering botanical notes…";
  let intelText="FloraLens is building a reusable species record so this only has to happen once.";
  if(intel){
    if(careAvailable>=4){
      intelTitle="Growing guide ready";
      intelText=care.usedPerenual
        ?"FloraLens found horticultural care data for this species and combined it with the botanical record."
        :care.usedLocal
          ?"FloraLens matched this plant to its curated UK-garden care library and filled gaps left by the botanical APIs."
          :"Connected botanical sources supplied useful growing information for this species.";
    }else if(taxonConfirmed){
      intelTitle="Botanical record found";
      intelText="The species is confirmed, but detailed horticultural care information is still limited for this plant.";
    }
  }

  const backRoute=isDiscovery?"discover":"garden";
  const backLabel=isDiscovery?"Discover":"My Garden";
  const heroLabel=isDiscovery
    ? (p.wishlist?"♥ Wishlist":"♡ Spotted")
    : `♡ ${esc(p.area||"My Garden")}`;

  view.innerHTML=`<section class="page-head"><button class="link-btn" onclick="setRoute('${backRoute}')">← ${backLabel}</button></section>
    <div class="result-hero" id="profileHero" style="min-height:390px"><div class="plant-art ${p.art||""}" style="position:absolute;inset:0"></div><div class="result-gradient"></div><div class="result-copy"><div class="eyebrow" style="color:white">${esc(p.family||"")}</div><h1>${esc(p.common)}</h1><em>${esc(p.scientific)}</em><br><span class="confidence">${heroLabel}</span></div></div>

    <div class="intel-banner ${!intel?"loading":""}">
      <div class="eyebrow">Botanical intelligence</div>
      <h2 style="font-size:24px;margin:5px 0">${esc(intelTitle)}</h2>
      <p class="small">${esc(intelText)}</p>
      ${intel?`<div class="coverage"><span style="width:${careCoverage}%"></span></div>
      <div class="small" style="margin-top:6px">${careCoverage}% of core care fields available</div>
      <div class="source-row">${sourceNames.map(s=>`<span class="source-pill">${esc(s)}</span>`).join("")}${care.localMatchLevel?`<span class="source-pill">Care match: ${esc(care.localMatchLevel)}</span>`:""}</div>
      <div class="action-row"><button class="mini-action" onclick="refreshIntel('${p.id}')">↻ Refresh notes</button><button class="mini-action" onclick="exportBackup()">⇩ Backup garden</button></div>`:""}
    </div>

    <section style="padding:10px 2px 0"><div class="eyebrow">Meet ${esc(p.common)}</div><h2 style="margin-top:6px">A little about this plant</h2><p class="sub">${esc(desc||"The species is identified, but the connected botanical records do not currently include a fuller description.")}</p><div class="species-cache">Species record: ${esc(p.speciesKey||"")} · ${cached.fetchedAt?new Date(cached.fetchedAt).toLocaleDateString("en-GB"):"local"}</div></section>

    <div class="season-card"><div class="eyebrow">Right now</div><h2>${seasonalLocal?"Seasonal care":"Seasonal note"}</h2><p class="sub" style="margin:0">${esc(seasonalLocal||currentSeasonNote(t,p).text)}</p></div>

    <div class="care-grid">
      ${care.light?`<div class="care-tile"><span class="care-icon">☀</span><b>Light</b><small>${esc(care.light)}</small></div>`:""}
      ${care.water?`<div class="care-tile"><span class="care-icon">💧</span><b>Water</b><small>${esc(care.water)}</small></div>`:""}
      ${care.soil?`<div class="care-tile"><span class="care-icon">♧</span><b>Soil</b><small>${esc(care.soil)}</small></div>`:""}
      ${care.height?`<div class="care-tile"><span class="care-icon">↕</span><b>Size</b><small>${esc(care.height)}</small></div>`:""}
      ${care.growthHabit?`<div class="care-tile"><span class="care-icon">❧</span><b>Growth habit</b><small>${esc(care.growthHabit)}</small></div>`:""}
      ${care.hardiness?`<div class="care-tile"><span class="care-icon">❄</span><b>Hardiness</b><small>${esc(care.hardiness)}</small></div>`:""}
      ${care.pruning?`<div class="care-tile care-wide"><span class="care-icon">✂</span><b>Pruning</b><small>${esc(care.pruning)}</small></div>`:""}
      ${care.propagation?`<div class="care-tile care-wide"><span class="care-icon">🌱</span><b>Propagation</b><small>${esc(care.propagation)}</small></div>`:""}
    </div>

    <div class="profile-card"><div class="eyebrow">In bloom</div><h2 style="font-size:25px;margin-top:6px">Flowering year</h2><div class="months">${["J","F","M","A","M","J","J","A","S","O","N","D"].map((m,i)=>`<div class="month ${bloom.includes(i+1)?"on":""}">${m}</div>`).join("")}</div>${!bloom.length?`<p class="small data-missing">Flowering months are not yet available for this plant.</p>`:""}</div>

    ${(care.growthHabit||care.growthRate||care.traitWoodiness||care.traitLeafType||care.traitHabitat||t?.flowerColors?.length||t?.foliageColors?.length)?`<div class="profile-card"><div class="eyebrow">How it grows</div><h2 style="font-size:25px;margin-top:6px">Botanical details</h2><div class="fact-list">
      ${care.growthHabit?`<div class="fact-row"><span class="fact-icon">❧</span><div><b>Habit</b><div class="small">${esc(care.growthHabit)}</div></div></div>`:""}
      ${care.growthRate?`<div class="fact-row"><span class="fact-icon">↗</span><div><b>Growth rate</b><div class="small">${esc(care.growthRate)}</div></div></div>`:""}
      ${care.traitWoodiness?`<div class="fact-row"><span class="fact-icon">♧</span><div><b>Woodiness</b><div class="small">${esc(care.traitWoodiness)}</div></div></div>`:""}
      ${care.traitLeafType?`<div class="fact-row"><span class="fact-icon">❧</span><div><b>Leaf type</b><div class="small">${esc(care.traitLeafType)}</div></div></div>`:""}
      ${care.traitHabitat?`<div class="fact-row"><span class="fact-icon">⌂</span><div><b>Habitat strategy</b><div class="small">${esc(care.traitHabitat)}</div></div></div>`:""}
      ${t?.flowerColors?.length?`<div class="fact-row"><span class="fact-icon">✿</span><div><b>Flower colours</b><div class="small">${esc(t.flowerColors.join(", "))}</div></div></div>`:""}
      ${t?.foliageColors?.length?`<div class="fact-row"><span class="fact-icon">❧</span><div><b>Foliage</b><div class="small">${esc(t.foliageColors.join(", "))}</div></div></div>`:""}
    </div></div>`:""}

    ${care.safety?`<div class="good-know"><div class="eyebrow">Good to know</div><h2 style="font-size:25px;margin:5px 0 7px">Safety</h2><p class="sub" style="margin:0">${esc(care.safety)}</p></div>`:""}

    ${care.usedLocal?`<div class="good-know"><div class="eyebrow">About these care notes</div><p class="sub" style="margin:0">Some horticultural details come from FloraLens' curated UK-garden care library because the connected botanical APIs often omit practical growing information. Species guidance is preferred where available; genus guidance is used as a cautious fallback.</p></div>`:""}

    ${care.usedTraits?`<div class="good-know"><div class="eyebrow">Plant trait record</div><p class="sub" style="margin:0">Growth form, woodiness, leaf type and measured height can come from the TRY File Archive ID 81 dataset. Where FloraLens derives a general watering or soil starting point from those traits, it is labelled as general guidance rather than species-specific API data.</p></div>`:""}

    ${isDiscovery?`
      <div class="profile-card discovery-profile-actions">
        <div class="eyebrow">Saved inspiration</div>
        <h2 style="font-size:25px;margin:6px 0 8px">${p.wishlist?"On your wishlist":"Spotted in Discover"}</h2>
        <p class="sub">Keep it here for reference, add it to your wishlist, or bring it into My Garden if it comes home with you.</p>
        <div class="actions">
          <button class="btn primary" onclick="addDiscoveryToGarden('${p.id}')">＋ Add to Garden</button>
          <button class="btn secondary" onclick="toggleWishlistFromProfile('${p.id}')">${p.wishlist?"♥ Remove wishlist":"♡ Add to wishlist"}</button>
        </div>
        <button class="link-btn discovery-delete-link" onclick="confirmDeleteDiscovery('${p.id}')">Remove from Discover</button>
      </div>
      <div class="section-title"><h3>Discovery story</h3></div>
      <div class="profile-card">
        <div class="timeline-item"><div class="timeline-icon">⌾</div><div><b>Spotted by FloraLens</b><div class="small">${p.spotted?new Date(p.spotted).toLocaleDateString("en-GB"):"Saved discovery"}</div></div></div>
        <div class="timeline-item"><div class="timeline-icon">📷</div><div><b>Identification photo saved</b><div class="small">${p.score?`${p.score}% identification match`:"Original identification photo stored on this device."}</div></div></div>
        ${intel?`<div class="timeline-item"><div class="timeline-icon">❧</div><div><b>Botanical record enriched</b><div class="small">${intel.fetchedAt?new Date(intel.fetchedAt).toLocaleDateString("en-GB"):"Cached"} · ${sourceNames.map(esc).join(" + ")||"connected sources"}</div></div></div>`:""}
      </div>`
      :`
      <div class="section-title"><h3>Our story</h3><button class="link-btn" onclick="addJournalForPlant('${p.id}')">＋ Add moment</button></div>
      <div class="profile-card"><div class="timeline-item"><div class="timeline-icon">✿</div><div><b>Added to FloraLens</b><div class="small">${esc(p.added||"")}</div></div></div>${[...state.journal].filter(j=>j.plantId===p.id).sort((x,y)=>String(y.date||"").localeCompare(String(x.date||""))).map(j=>`<div class="timeline-item story-moment"><div class="timeline-icon">${journalTypeIcon(j.type)}</div><div class="story-moment-copy"><b>${esc(j.type||"Garden moment")}</b><div class="small">${formatJournalDate(j.date)}</div>${j.text?`<div class="story-note">${esc(j.text)}</div>`:""}${j.photoKey?`<div class="story-thumb" data-photo-key="${esc(j.photoKey)}"></div>`:""}</div></div>`).join("")}<div class="timeline-item"><div class="timeline-icon">📷</div><div><b>Plant profile created</b><div class="small">Its original identification photo is stored on this device.</div></div></div>${intel?`<div class="timeline-item"><div class="timeline-icon">❧</div><div><b>Botanical record enriched</b><div class="small">${intel.fetchedAt?new Date(intel.fetchedAt).toLocaleDateString("en-GB"):"Cached"} · ${sourceNames.map(esc).join(" + ")||"connected sources"}</div></div></div>`:""}</div>
      `}`;

  if(p.photoKey){
    const url=await getPhotoUrl(p.photoKey);
    if(url){ document.querySelector("#profileHero .plant-art")?.remove(); profileHero.insertAdjacentHTML("afterbegin",`<img class="photo-hero" src="${url}" alt="${esc(p.common)}">`); }
  }
  hydratePhotos();
}
async function exportBackup(){
  try{
    const photos={};
    for(const p of [...state.plants,...state.discoveries,...state.journal]){
      if(!p.photoKey) continue;
      const db=await photoDB();
      const blob=await new Promise((resolve,reject)=>{
        const tx=db.transaction(PHOTO_STORE,"readonly");
        const req=tx.objectStore(PHOTO_STORE).get(p.photoKey);
        req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
      });
      if(blob) photos[p.photoKey]=await blobToDataUrl(blob);
    }
    const payload={format:"FloraLens Backup",version:3,exportedAt:new Date().toISOString(),state,photos};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`FloraLens-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    toast("Garden backup created");
  }catch(err){ console.error(err); toast("Backup couldn’t be created"); }
}
function blobToDataUrl(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);});}

function confirmDeletePlant(id){
  const p=state.plants.find(x=>x.id===id);
  if(!p) return;
  modal(`<div class="eyebrow">Remove from your garden</div><h2>Delete ${esc(p.common)}?</h2><p class="sub">This removes the plant entry and its saved identification photo from this device. The shared species knowledge stays cached for future identifications.</p><div class="actions"><button class="btn secondary" onclick="closeModal()">Keep it</button><button class="btn danger" onclick="deletePlant('${p.id}')">Delete plant</button></div>`);
}
async function deletePlant(id){
  const p=state.plants.find(x=>x.id===id);
  if(!p) return;
  state.plants=state.plants.filter(x=>x.id!==id);
  saveState();
  closeModal();
  await deletePhoto(p.photoKey);
  toast(`${p.common} removed`);
  renderHome();
}

function journalTypeIcon(type){
  return ({"Flowering":"✿","New growth":"❧","Pruned":"✂","Moved":"⌂","Problem":"!","Repotted":"◌","Planted":"♧","Harvest":"◇","Note":"✎"})[type]||"✎";
}
function formatJournalDate(v){
  if(!v)return "";
  const d=new Date(`${v}T12:00:00`);
  return d.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
}
function renderJournal(){
  const entries=[...state.journal].sort((x,y)=>String(y.date||"").localeCompare(String(x.date||"")));
  const plantCount=new Set(entries.map(j=>j.plantId)).size;
  view.innerHTML=`<section class="page-head"><div class="eyebrow">Garden memories</div><h1>Journal</h1><p class="sub">A living record of what changed, flowered, moved and surprised you.</p></section>
  <button class="journal-hero-button" onclick="openJournalComposer()"><span class="journal-hero-mark">✎</span><span><strong>Add a garden moment</strong><small>Photo, note, care job or milestone</small></span><b>＋</b></button>
  <div class="stats-strip"><div class="stat"><b>${entries.length}</b><small>moments</small></div><div class="stat"><b>${plantCount}</b><small>plants</small></div><div class="stat"><b>${entries.filter(j=>j.photoKey).length}</b><small>photos</small></div></div>
  ${entries.length?`<div class="journal-feed">${entries.map(j=>{
    const p=state.plants.find(x=>x.id===j.plantId); if(!p)return "";
    return `<article class="journal-entry" onclick="if(!event.target.closest('button')) setRoute('profile',{id:'${p.id}'})">
      ${j.photoKey?`<div class="journal-photo" data-photo-key="${esc(j.photoKey)}"></div>`:""}
      <div class="journal-entry-body"><div class="journal-date">${formatJournalDate(j.date)}</div>
      <div class="journal-entry-head"><span class="journal-type">${journalTypeIcon(j.type)} ${esc(j.type||"Note")}</span><button class="journal-delete" onclick="event.stopPropagation();confirmDeleteJournal('${j.id}')">×</button></div>
      <h2>${esc(p.common)}</h2><em>${esc(p.scientific)}</em>${j.text?`<p>${esc(j.text)}</p>`:""}<div class="journal-link">View ${esc(p.common)} →</div></div>
    </article>`}).join("")}</div>`:`<div class="empty-card journal-empty"><div class="pressed-flower">❀</div><h2>Your garden story starts here</h2><p class="sub">Capture first flowers, new growth, pruning, moves, problems or simply a moment you loved.</p><button class="btn primary" onclick="openJournalComposer()">Add first moment</button></div>`}`;
  hydratePhotos();
}
function addJournalForPlant(id){openJournalComposer(id)}
function openJournalComposer(plantId=null){
  if(!state.plants.length){modal(`<div class="eyebrow">Garden journal</div><h2>Add a plant first</h2><p class="sub">Journal moments belong to plants in My Garden.</p><button class="btn primary" style="width:100%" onclick="closeModal();startCamera('identify')">Identify a plant</button>`);return}
  pendingJournalPlantId=plantId||state.plants[0].id; pendingJournalPhotoFile=null; renderJournalComposer();
}
function renderJournalComposer(){
  const p=state.plants.find(x=>x.id===pendingJournalPlantId)||state.plants[0]; if(!p)return;
  pendingJournalPlantId=p.id;
  const types=["Flowering","New growth","Pruned","Moved","Problem","Repotted","Planted","Harvest","Note"];
  modal(`<div class="journal-composer"><div class="eyebrow">Garden moment</div><h2>Add to the story</h2>
  <label class="field-label">Plant</label><select id="journalPlant" class="journal-field" onchange="pendingJournalPlantId=this.value">${state.plants.map(x=>`<option value="${x.id}" ${x.id===p.id?"selected":""}>${esc(x.common)} · ${esc(x.area||"Unplaced")}</option>`).join("")}</select>
  <label class="field-label">What happened?</label><div class="journal-type-grid">${types.map((t,i)=>`<button type="button" class="journal-type-choice ${i===0?"active":""}" data-journal-type="${esc(t)}" onclick="selectJournalType(this)">${journalTypeIcon(t)}<span>${esc(t)}</span></button>`).join("")}</div><input type="hidden" id="journalType" value="Flowering">
  <div class="journal-two-col"><div><label class="field-label">Date</label><input id="journalDate" class="journal-field" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div><label class="field-label">Photo</label><button class="journal-photo-button" type="button" onclick="journalPhotoInput.click()">📷 <span id="journalPhotoLabel">Add photo</span></button></div></div>
  <label class="field-label">A little note</label><textarea id="journalText" class="journal-field journal-textarea" maxlength="500" placeholder="What changed? What did you notice?"></textarea>
  <button class="btn primary" style="width:100%;margin-top:14px" onclick="saveJournalMoment()">Save moment</button></div>`);
}
function selectJournalType(btn){
  document.querySelectorAll(".journal-type-choice").forEach(x=>x.classList.remove("active"));btn.classList.add("active");document.getElementById("journalType").value=btn.dataset.journalType;
}
journalPhotoInput.addEventListener("change",()=>{
  const f=journalPhotoInput.files?.[0];if(!f)return;pendingJournalPhotoFile=f;
  const el=document.getElementById("journalPhotoLabel");if(el)el.textContent="Photo ready ✓";journalPhotoInput.value="";
});
async function saveJournalMoment(){
  const plantId=document.getElementById("journalPlant")?.value||pendingJournalPlantId;
  const p=state.plants.find(x=>x.id===plantId);if(!p)return;
  const id="journal-"+Date.now(), photoKey=pendingJournalPhotoFile?`${id}-photo`:null;
  if(photoKey){try{await savePhoto(photoKey,pendingJournalPhotoFile)}catch(e){console.warn(e)}}
  state.journal.unshift({id,plantId,date:document.getElementById("journalDate")?.value||new Date().toISOString().slice(0,10),type:document.getElementById("journalType")?.value||"Note",text:(document.getElementById("journalText")?.value||"").trim(),photoKey,createdAt:new Date().toISOString()});
  saveState();pendingJournalPhotoFile=null;pendingJournalPlantId=null;closeModal();toast(`Moment added to ${p.common}`);setRoute("journal");
}
function confirmDeleteJournal(id){
  const j=state.journal.find(x=>x.id===id);if(!j)return;
  modal(`<div class="eyebrow">Journal</div><h2>Remove this moment?</h2><p class="sub">The note${j.photoKey?" and photo":""} will be removed from this device.</p><div class="actions"><button class="btn secondary" onclick="closeModal()">Keep it</button><button class="btn danger" onclick="deleteJournalMoment('${id}')">Delete</button></div>`);
}
async function deleteJournalMoment(id){
  const j=state.journal.find(x=>x.id===id);if(!j)return;state.journal=state.journal.filter(x=>x.id!==id);saveState();closeModal();if(j.photoKey)await deletePhoto(j.photoKey);toast("Journal moment removed");renderJournal();
}
function addJournalForPlant(id){const p=state.plants.find(x=>x.id===id);modal(`<div class="eyebrow">${esc(p.common)}</div><h2>Add to its story</h2><textarea id="journalText" class="search" style="min-height:110px" placeholder="What did you notice?"></textarea><button class="btn primary" style="width:100%" onclick="saveJournal()">Save moment</button>`)}

function renderDiscover(){
  const items=state.discoveries;
  const families=new Set(items.map(d=>d.family).filter(Boolean)).size;
  const wishlist=items.filter(d=>d.wishlist).length;

  view.innerHTML=`<section class="page-head"><div class="eyebrow">Saved inspiration</div><h1>Discover</h1><p class="sub">Plants you've spotted, loved or might want to bring home one day.</p></section>
    <button class="lens-banner" style="background:linear-gradient(135deg,#91727d,#ba969f)" onclick="startCamera('discover')">
      <span class="lens-icon">⌾</span><span><strong>Identify while you're out</strong><small>Perfect for garden centres, walks and plants you don't own.</small></span>
    </button>
    <div class="stats-strip"><div class="stat"><b>${items.length}</b><small>discoveries</small></div><div class="stat"><b>${families}</b><small>families</small></div><div class="stat"><b>${wishlist}</b><small>wishlist</small></div></div>
    ${items.length
      ? `<section class="masonry discovery-masonry">${items.map(d=>`<article class="pin discovery-pin" onclick="if(!event.target.closest('button')) setRoute('profile',{id:'${d.id}'})">
          <div class="plant-art" data-photo-key="${esc(d.photoKey||"")}"></div>
          <button class="pin-delete" aria-label="Delete ${esc(d.common)}" onclick="event.stopPropagation();confirmDeleteDiscovery('${d.id}')">×</button>
          <button class="wishlist-heart ${d.wishlist?"active":""}" onclick="event.stopPropagation();toggleWishlist('${d.id}')" aria-label="Wishlist">${d.wishlist?"♥":"♡"}</button>
          <div class="pin-body">
            <b>${esc(d.common)}</b><small><i>${esc(d.scientific)}</i></small>
            <div class="discovery-meta"><span class="chip">${d.score||"—"}% match</span><span class="chip">${d.wishlist?"Wishlist":"Spotted"}</span></div>
            <button class="mini-action" onclick="event.stopPropagation();addDiscoveryToGarden('${d.id}')">＋ Add to Garden</button>
          </div>
        </article>`).join("")}</section>`
      : `<div class="empty-card" style="text-align:center;padding:38px 22px"><div style="font-size:52px;color:var(--rose)">❀</div><h2 style="font-size:27px">Your botanical scrapbook</h2><p class="sub">Identify something you like without adding it to your garden. Save it here, wishlist it, or bring it into My Garden later.</p><button class="btn primary" onclick="startCamera('discover')">Find something</button></div>`}`;
  hydratePhotos();
}
function showLensTips(){modal(`<div class="eyebrow">Photo tips</div><h2>Help FloraLens see clearly</h2><p class="sub">Fill most of the frame with the plant, use good light and photograph a distinctive flower or leaf. All images in one request should show the same individual plant.</p><button class="btn primary" style="width:100%" onclick="closeModal()">Got it</button>`)}
function modal(html){document.body.insertAdjacentHTML("beforeend",`<div class="modal" id="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">${html}</div></div>`)}
function closeModal(){document.getElementById("modal")?.remove()}

document.addEventListener("click",e=>{
  const routeTarget=e.target.closest("[data-route]");
  if(!routeTarget) return;
  const route=routeTarget.dataset.route;
  if(route==="lens" && routeTarget.classList.contains("lens-nav")){
    e.preventDefault();
    startCamera();
    return;
  }
  setRoute(route);
});
cameraInput.addEventListener("change",e=>{ if(e.target.files[0]) addCapture(e.target.files[0],"auto"); e.target.value=""; });
galleryInput.addEventListener("change",e=>{ if(e.target.files[0]) addCapture(e.target.files[0],"auto"); e.target.value=""; });
multiPhotoInput.addEventListener("change",e=>{ if(e.target.files[0]) addCapture(e.target.files[0],window.captureOrgan||"auto"); e.target.value=""; });


function refreshStoredCareFields(){
  let changed=false;
  for(const p of state.plants){
    const intel=state.speciesCache[p.speciesKey]?.enrichment||null;
    const care=resolvedCare(p.scientific,intel?.trefle||null,intel?.perenual||null);
    const set=(k,v)=>{ if(usable(v) && p[k]!==v){p[k]=v;changed=true;} };
    set("sun",care.light); set("water",care.water); set("soil",care.soil); set("height",care.height);
    if(care.bloomMonths?.length && JSON.stringify(p.bloom)!==JSON.stringify(care.bloomMonths)){p.bloom=care.bloomMonths;changed=true;}
  }
  if(changed) saveState();
}

menuBtn?.addEventListener("click",()=>{
  modal(`<div class="eyebrow">FloraLens</div><h2>Garden tools</h2><div class="backup-card"><b>Keep your garden safe</b><p class="small">Export a single backup containing plant records, journal data, species intelligence and locally stored hero photos.</p><button class="btn primary" style="width:100%" onclick="exportBackup();closeModal()">⇩ Export backup</button></div><div class="small">FloraLens v0.9 · private botanical journal</div>`);
});

refreshStoredCareFields();
renderHome();
