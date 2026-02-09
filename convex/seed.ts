import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

function getId<T>(arr: T[], idx: number): T {
  const id = arr[idx];
  if (id === undefined) throw new Error(`Index ${idx} out of bounds`);
  return id;
}

/**
 * Seed the database with realistic development data.
 * Run with: npx convex run seed:populate
 */
export const populate = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingUsers = await ctx.db.query("users").take(1);
    if (existingUsers.length > 0) {
      return "Database already has data. Skipping seed.";
    }

    const now = Date.now();
    const day = 86400000;

    // ============================================================
    // BUSINESS USERS + PROFILES
    // ============================================================
    const businessData = [
      {
        name: "Sarah Chen",
        email: "sarah@bidamanda.com",
        businessName: "Bida Manda",
        category: "restaurant",
        description:
          "Laotian-inspired restaurant in downtown Raleigh. Creative cocktails, shareable plates, vibrant atmosphere.",
        address: "222 S Blount St",
        city: "Raleigh",
        state: "NC",
        zipCode: "27601",
        latitude: 35.7751,
        longitude: -78.6353,
        instagramHandle: "@bidamanda",
      },
      {
        name: "Marcus Johnson",
        email: "marcus@umsteadspa.com",
        businessName: "The Umstead Spa",
        category: "med_spa",
        description:
          "Luxury spa and wellness center offering facials, massages, and rejuvenation treatments.",
        address: "100 Woodland Pond Dr",
        city: "Cary",
        state: "NC",
        zipCode: "27513",
        latitude: 35.8101,
        longitude: -78.7872,
        instagramHandle: "@umsteadspa",
      },
      {
        name: "Alex Rivera",
        email: "alex@arrowhaircuts.com",
        businessName: "Arrow Haircuts",
        category: "salon",
        description:
          "Modern barbershop in North Hills. Premium cuts, straight razor shaves, and craft beverages.",
        address: "4421 Six Forks Rd",
        city: "Raleigh",
        state: "NC",
        zipCode: "27609",
        latitude: 35.8374,
        longitude: -78.6421,
        instagramHandle: "@arrowhaircuts",
      },
      {
        name: "Dana Kim",
        email: "dana@otfraleigh.com",
        businessName: "Orangetheory Fitness North Hills",
        category: "fitness",
        description:
          "High-energy group fitness studio with heart-rate based interval training.",
        address: "4351 The Circle at North Hills",
        city: "Raleigh",
        state: "NC",
        zipCode: "27609",
        latitude: 35.8399,
        longitude: -78.6432,
        instagramHandle: "@otf_northhills",
      },
      {
        name: "Liam O'Brien",
        email: "liam@viderichocolate.com",
        businessName: "Videri Chocolate Factory",
        category: "retail",
        description:
          "Bean-to-bar chocolate factory and cafe in the Warehouse District. Tours, tastings, and handcrafted treats.",
        address: "327 W Davie St",
        city: "Raleigh",
        state: "NC",
        zipCode: "27601",
        latitude: 35.7721,
        longitude: -78.6428,
        instagramHandle: "@viderichocolate",
      },
    ];

    const businessIds: Id<"businesses">[] = [];

    for (const b of businessData) {
      const userId = await ctx.db.insert("users", {
        clerkId: `seed_business_${b.email}`,
        email: b.email,
        role: "business",
        name: b.name,
        isActive: true,
        createdAt: now - 30 * day,
        lastActiveAt: now,
      });

      const businessId = await ctx.db.insert("businesses", {
        userId,
        name: b.businessName,
        category: b.category,
        description: b.description,
        address: b.address,
        city: b.city,
        state: b.state,
        zipCode: b.zipCode,
        latitude: b.latitude,
        longitude: b.longitude,
        instagramHandle: b.instagramHandle,
        instagramConnected: false,
        tiktokConnected: false,
        photos: [],
        averageCreatorRating: 0,
        totalCompletedDeals: 0,
        offerAccuracyRate: 1.0,
        cancellationRate: 0,
        averageResponseTimeHours: 0,
        isVerified: false,
        isActive: true,
        createdAt: now - 30 * day,
      });

      businessIds.push(businessId);
    }

    // ============================================================
    // CREATOR USERS + PROFILES
    // ============================================================
    const creatorData = [
      // 3 "new" tier
      {
        name: "Jess Taylor",
        email: "jess@creator.com",
        bio: "Food and lifestyle in the Triangle. Always hunting for the best brunch spots.",
        niches: ["food", "lifestyle"],
        instagramHandle: "@jesstayloreats",
        followers: 1200,
        engagement: 4.5,
        tier: "new",
        deals: 0,
        fulfillment: 1.0,
        reliability: 15,
      },
      {
        name: "Marco Perez",
        email: "marco@creator.com",
        bio: "Fitness content creator. Gym reviews, workout tips, and healthy eats in Raleigh.",
        niches: ["fitness", "health"],
        instagramHandle: "@marcofitraleigh",
        followers: 800,
        engagement: 5.2,
        tier: "new",
        deals: 0,
        fulfillment: 1.0,
        reliability: 10,
      },
      {
        name: "Ava Chen",
        email: "ava@creator.com",
        bio: "Beauty and skincare enthusiast. Honest reviews of local spas and salons.",
        niches: ["beauty", "lifestyle"],
        instagramHandle: "@avaglowsnc",
        followers: 1500,
        engagement: 3.8,
        tier: "new",
        deals: 1,
        fulfillment: 1.0,
        reliability: 20,
      },
      // 3 "established" tier
      {
        name: "DeAndre Williams",
        email: "deandre@creator.com",
        bio: "Local food and nightlife in Raleigh-Durham. 15K followers who trust my recommendations.",
        niches: ["food", "lifestyle", "travel"],
        instagramHandle: "@deandreeats",
        followers: 15000,
        engagement: 5.0,
        tier: "established",
        deals: 5,
        fulfillment: 1.0,
        reliability: 72,
      },
      {
        name: "Priya Sharma",
        email: "priya@creator.com",
        bio: "Wellness and beauty content. Yoga instructor by day, content creator by passion.",
        niches: ["beauty", "fitness", "health"],
        instagramHandle: "@priyawellnc",
        followers: 4200,
        engagement: 4.8,
        tier: "established",
        deals: 4,
        fulfillment: 0.9,
        reliability: 65,
      },
      {
        name: "Tyler Brooks",
        email: "tyler@creator.com",
        bio: "Fashion and lifestyle. Raleigh's best-dressed. Making the Triangle look good.",
        niches: ["fashion", "lifestyle"],
        instagramHandle: "@tylerbrooksnc",
        followers: 3800,
        engagement: 4.2,
        tier: "established",
        deals: 3,
        fulfillment: 1.0,
        reliability: 68,
      },
      // 3 "trusted" tier
      {
        name: "Mia Rodriguez",
        email: "mia@creator.com",
        bio: "The Triangle's go-to food creator. Reel queen. 20K local followers who eat where I eat.",
        niches: ["food", "lifestyle"],
        instagramHandle: "@miaeatstriangle",
        followers: 20000,
        engagement: 5.5,
        tier: "trusted",
        deals: 15,
        fulfillment: 0.95,
        reliability: 88,
      },
      {
        name: "Noah Kim",
        email: "noah@creator.com",
        bio: "Lifestyle and travel content. Coffee shops, hidden gems, and weekend adventures around NC.",
        niches: ["lifestyle", "travel", "food"],
        instagramHandle: "@noahexploresnc",
        followers: 12000,
        engagement: 4.6,
        tier: "trusted",
        deals: 12,
        fulfillment: 0.93,
        reliability: 85,
      },
      {
        name: "Zara Ahmed",
        email: "zara@creator.com",
        bio: "Beauty and wellness creator. Honest, detailed reviews. My followers actually buy what I recommend.",
        niches: ["beauty", "health", "lifestyle"],
        instagramHandle: "@zarabeautync",
        followers: 8500,
        engagement: 6.1,
        tier: "trusted",
        deals: 11,
        fulfillment: 0.96,
        reliability: 90,
      },
      // 1 "verified" tier
      {
        name: "Jordan Blake",
        email: "jordan@creator.com",
        bio: "Raleigh's top food and lifestyle creator. 30K engaged local followers. Featured in News & Observer.",
        niches: ["food", "lifestyle", "travel"],
        instagramHandle: "@jordanblakenc",
        followers: 30000,
        engagement: 5.8,
        tier: "verified",
        deals: 32,
        fulfillment: 0.98,
        reliability: 96,
      },
    ];

    const creatorIds: Id<"creators">[] = [];

    for (const c of creatorData) {
      const userId = await ctx.db.insert("users", {
        clerkId: `seed_creator_${c.email}`,
        email: c.email,
        role: "creator",
        name: c.name,
        isActive: true,
        createdAt: now - 60 * day,
        lastActiveAt: now,
      });

      const creatorId = await ctx.db.insert("creators", {
        userId,
        bio: c.bio,
        niches: c.niches,
        city: "Raleigh",
        state: "NC",
        latitude: 35.7796 + (Math.random() - 0.5) * 0.1,
        longitude: -78.6382 + (Math.random() - 0.5) * 0.1,
        instagramHandle: c.instagramHandle,
        instagramConnected: false,
        instagramFollowerCount: c.followers,
        instagramEngagementRate: c.engagement,
        tiktokConnected: false,
        trustTier: c.tier,
        fulfillmentRate: c.fulfillment,
        averageContentRating: c.deals > 0 ? 4.0 + Math.random() : 0,
        totalCompletedDeals: c.deals,
        totalRedeemedDeals: c.deals,
        onTimeRate: 0.9 + Math.random() * 0.1,
        reliabilityScore: c.reliability,
        averageResponseTimeHours: 1 + Math.random() * 5,
        hasCardOnFile: c.tier !== "new",
        isActive: true,
        isSuspended: false,
        createdAt: now - 60 * day,
        metricsLastUpdatedAt: now,
      });

      creatorIds.push(creatorId);
    }

    // ============================================================
    // OFFERS (8 across the 5 businesses)
    // ============================================================
    const offersData = [
      {
        businessIdx: 0, // Bida Manda
        title: "Dinner for 2 at Bida Manda",
        description:
          "Enjoy a full dinner experience for two, including appetizers and entrees (up to $100). Excludes alcohol.",
        category: "restaurant",
        barterRetailValue: 100,
        contentTier: 2,
        deliverables: [
          { platform: "instagram", type: "reel", minDurationSeconds: 15, quantity: 1 },
        ],
        requiredTags: ["@bidamanda"],
        requiredHashtags: ["#raleigheats", "#bidamanda"],
        visibility: "open",
      },
      {
        businessIdx: 0, // Bida Manda
        title: "Cocktail tasting experience",
        description:
          "Complimentary cocktail flight (4 signature cocktails) for you and a guest.",
        category: "restaurant",
        barterRetailValue: 50,
        contentTier: 1,
        deliverables: [
          { platform: "instagram", type: "story", quantity: 3 },
        ],
        requiredTags: ["@bidamanda"],
        requiredHashtags: ["#raleighcocktails"],
        visibility: "open",
      },
      {
        businessIdx: 1, // Umstead Spa
        title: "Signature facial treatment",
        description:
          "Our 60-minute signature facial with customized products. Valued at $180.",
        category: "med_spa",
        barterRetailValue: 180,
        contentTier: 3,
        deliverables: [
          { platform: "instagram", type: "reel", minDurationSeconds: 15, quantity: 1 },
          { platform: "instagram", type: "story", quantity: 3 },
        ],
        requiredTags: ["@umsteadspa"],
        requiredHashtags: ["#raleighspa", "#selfcare"],
        visibility: "established_plus",
      },
      {
        businessIdx: 2, // Arrow Haircuts
        title: "Premium haircut + beard trim",
        description:
          "Full haircut and beard trim with our senior barber. Includes hot towel treatment.",
        category: "salon",
        barterRetailValue: 65,
        contentTier: 2,
        deliverables: [
          { platform: "instagram", type: "reel", minDurationSeconds: 15, quantity: 1 },
        ],
        requiredTags: ["@arrowhaircuts"],
        requiredHashtags: ["#raleighbarber"],
        visibility: "open",
      },
      {
        businessIdx: 3, // OTF
        title: "1-month unlimited membership",
        description:
          "Free month of unlimited Orangetheory classes. Perfect for fitness creators.",
        category: "fitness",
        barterRetailValue: 120,
        contentTier: 3,
        deliverables: [
          { platform: "instagram", type: "reel", minDurationSeconds: 15, quantity: 2 },
          { platform: "instagram", type: "story", quantity: 4 },
        ],
        requiredTags: ["@otf_northhills"],
        requiredHashtags: ["#orangetheory", "#raleighfitness"],
        visibility: "established_plus",
      },
      {
        businessIdx: 3, // OTF
        title: "Free week of classes",
        description:
          "Try Orangetheory for a week. Show your followers what a class is like.",
        category: "fitness",
        barterRetailValue: 40,
        contentTier: 1,
        deliverables: [
          { platform: "instagram", type: "story", quantity: 2 },
        ],
        requiredTags: ["@otf_northhills"],
        requiredHashtags: ["#orangetheory"],
        visibility: "open",
      },
      {
        businessIdx: 4, // Videri
        title: "Chocolate factory tour + tasting",
        description:
          "Private tour of our bean-to-bar factory plus a curated tasting box to take home.",
        category: "retail",
        barterRetailValue: 55,
        contentTier: 2,
        deliverables: [
          { platform: "instagram", type: "reel", minDurationSeconds: 15, quantity: 1 },
        ],
        requiredTags: ["@viderichocolate"],
        requiredHashtags: ["#raleighfood", "#viderichocolate"],
        visibility: "open",
      },
      {
        businessIdx: 4, // Videri
        title: "Custom gift box for content",
        description:
          "Receive a premium gift box of our artisan chocolates ($75 value) in exchange for a TikTok or Reel.",
        category: "retail",
        barterRetailValue: 75,
        contentTier: 2,
        deliverables: [
          { platform: "instagram", type: "reel", minDurationSeconds: 15, quantity: 1 },
        ],
        requiredTags: ["@viderichocolate"],
        requiredHashtags: ["#raleigheats", "#chocolatelover"],
        visibility: "open",
      },
    ];

    const offerIds: Id<"offers">[] = [];

    for (const o of offersData) {
      const offerId = await ctx.db.insert("offers", {
        businessId: getId(businessIds, o.businessIdx),
        title: o.title,
        description: o.description,
        category: o.category,
        compensationType: "barter",
        barterDescription: o.description,
        barterRetailValue: o.barterRetailValue,
        contentTier: o.contentTier,
        deliverables: o.deliverables,
        contentWindowHours: 48,
        persistenceDays: 7,
        requiredTags: o.requiredTags,
        requiredHashtags: o.requiredHashtags,
        requireLocationTag: true,
        usageRights: "repost_with_credit",
        availabilityWindows: [
          { dayOfWeek: [2, 3, 4], startTime: "17:00", endTime: "21:00" },
        ],
        maxRedemptionsPerWeek: 3,
        currentWeekRedemptions: 0,
        visibility: o.visibility,
        state: "active",
        totalApplications: 0,
        totalCompletedDeals: 0,
        averageContentRating: 0,
        createdAt: now - 14 * day,
        updatedAt: now - 14 * day,
      });

      offerIds.push(offerId);
    }

    // ============================================================
    // DEALS (15 in various states)
    // ============================================================
    const contractTerms = (offerIdx: number) => {
      const o = offersData[offerIdx];
      return {
        compensationType: "barter" as const,
        barterDescription: o.description,
        barterRetailValue: o.barterRetailValue,
        contentTier: o.contentTier,
        deliverables: o.deliverables,
        contentWindowHours: 48,
        persistenceDays: 7,
        requiredTags: o.requiredTags,
        requiredHashtags: o.requiredHashtags,
        requireLocationTag: true,
        usageRights: "repost_with_credit",
      };
    };

    const deposit = (tier: string) => ({
      required: tier === "new" || tier === "established",
      amount: tier === "new" ? 10 : tier === "established" ? 15 : 0,
      status: "none",
    });

    const fee = (value: number) => ({
      amount: value <= 75 ? 15 : value <= 200 ? 20 : 25,
      status: "pending",
    });

    // 3 applied
    for (let i = 0; i < 3; i++) {
      await ctx.db.insert("deals", {
        offerId: getId(offerIds, i),
        businessId: getId(businessIds, offersData[i].businessIdx),
        creatorId: getId(creatorIds, i),
        state: "applied",
        stateUpdatedAt: now - 2 * day,
        stateHistory: [],
        contractTerms: contractTerms(i),
        scheduledDate: now + 5 * day,
        creatorNote: "I'd love to create content for you!",
        appliedAt: now - 2 * day,
        businessConfirmedArrival: false,
        commitmentDeposit: deposit("new"),
        platformFee: fee(offersData[i].barterRetailValue),
        createdAt: now - 2 * day,
        updatedAt: now - 2 * day,
      });
    }

    // 2 approved
    for (let i = 0; i < 2; i++) {
      await ctx.db.insert("deals", {
        offerId: getId(offerIds, 3 + i),
        businessId: getId(businessIds, offersData[3 + i].businessIdx),
        creatorId: getId(creatorIds, 3 + i),
        state: "approved",
        stateUpdatedAt: now - 1 * day,
        stateHistory: [
          {
            fromState: "applied",
            toState: "approved",
            trigger: "business_approve",
            actor: "business",
            timestamp: now - 1 * day,
          },
        ],
        contractTerms: contractTerms(3 + i),
        scheduledDate: now + 3 * day,
        appliedAt: now - 3 * day,
        approvedAt: now - 1 * day,
        businessConfirmedArrival: false,
        commitmentDeposit: deposit("established"),
        platformFee: fee(offersData[3 + i].barterRetailValue),
        createdAt: now - 3 * day,
        updatedAt: now - 1 * day,
      });
    }

    // 1 checked_in
    await ctx.db.insert("deals", {
      offerId: getId(offerIds, 5),
      businessId: getId(businessIds, offersData[5].businessIdx),
      creatorId: getId(creatorIds, 5),
      state: "checked_in",
      stateUpdatedAt: now - 2 * 3600000,
      stateHistory: [
        {
          fromState: "applied",
          toState: "approved",
          trigger: "business_approve",
          actor: "business",
          timestamp: now - 3 * day,
        },
        {
          fromState: "approved",
          toState: "checked_in",
          trigger: "creator_checkin",
          actor: "creator",
          timestamp: now - 2 * 3600000,
        },
      ],
      contractTerms: contractTerms(5),
      scheduledDate: now,
      appliedAt: now - 5 * day,
      approvedAt: now - 3 * day,
      checkedInAt: now - 2 * 3600000,
      checkinMethod: "geofence",
      businessConfirmedArrival: true,
      commitmentDeposit: deposit("established"),
      platformFee: fee(offersData[5].barterRetailValue),
      createdAt: now - 5 * day,
      updatedAt: now - 2 * 3600000,
    });

    // 2 content_pending
    for (let i = 0; i < 2; i++) {
      await ctx.db.insert("deals", {
        offerId: getId(offerIds, 6 + i),
        businessId: getId(businessIds, offersData[6 + i].businessIdx),
        creatorId: getId(creatorIds, 6 + i),
        state: "content_pending",
        stateUpdatedAt: now - 12 * 3600000,
        stateHistory: [
          {
            fromState: "applied",
            toState: "approved",
            trigger: "business_approve",
            actor: "business",
            timestamp: now - 5 * day,
          },
          {
            fromState: "approved",
            toState: "checked_in",
            trigger: "creator_checkin",
            actor: "creator",
            timestamp: now - 1 * day,
          },
          {
            fromState: "checked_in",
            toState: "redeemed",
            trigger: "business_confirm_service",
            actor: "business",
            timestamp: now - 1 * day + 3600000,
          },
          {
            fromState: "redeemed",
            toState: "content_pending",
            trigger: "auto",
            actor: "system",
            timestamp: now - 1 * day + 3600000,
          },
        ],
        contractTerms: contractTerms(6 + i),
        scheduledDate: now - 1 * day,
        appliedAt: now - 7 * day,
        approvedAt: now - 5 * day,
        checkedInAt: now - 1 * day,
        checkinMethod: "code",
        businessConfirmedArrival: true,
        commitmentDeposit: deposit("trusted"),
        platformFee: fee(offersData[6 + i].barterRetailValue),
        createdAt: now - 7 * day,
        updatedAt: now - 12 * 3600000,
      });
    }

    // 1 content_verified
    await ctx.db.insert("deals", {
      offerId: getId(offerIds, 0),
      businessId: getId(businessIds, 0),
      creatorId: getId(creatorIds, 8),
      state: "content_verified",
      stateUpdatedAt: now - 6 * 3600000,
      stateHistory: [
        {
          fromState: "applied",
          toState: "approved",
          trigger: "business_approve",
          actor: "business",
          timestamp: now - 10 * day,
        },
        {
          fromState: "approved",
          toState: "checked_in",
          trigger: "creator_checkin",
          actor: "creator",
          timestamp: now - 3 * day,
        },
        {
          fromState: "checked_in",
          toState: "redeemed",
          trigger: "business_confirm_service",
          actor: "business",
          timestamp: now - 3 * day + 3600000,
        },
        {
          fromState: "redeemed",
          toState: "content_pending",
          trigger: "auto",
          actor: "system",
          timestamp: now - 3 * day + 3600000,
        },
        {
          fromState: "content_pending",
          toState: "content_submitted",
          trigger: "creator_submit_content",
          actor: "creator",
          timestamp: now - 1 * day,
        },
        {
          fromState: "content_submitted",
          toState: "content_verified",
          trigger: "auto_verification_passed",
          actor: "system",
          timestamp: now - 6 * 3600000,
        },
      ],
      contractTerms: contractTerms(0),
      scheduledDate: now - 3 * day,
      appliedAt: now - 12 * day,
      approvedAt: now - 10 * day,
      checkedInAt: now - 3 * day,
      checkinMethod: "geofence",
      businessConfirmedArrival: true,
      contentSubmittedAt: now - 1 * day,
      contentVerifiedAt: now - 6 * 3600000,
      commitmentDeposit: deposit("trusted"),
      platformFee: fee(100),
      createdAt: now - 12 * day,
      updatedAt: now - 6 * 3600000,
    });

    // 4 completed (with ratings)
    for (let i = 0; i < 4; i++) {
      const creatorIdx = 6 + i; // trusted and verified creators
      const offerIdx = i % offersData.length;
      const completedAt = now - (20 + i * 5) * day;

      await ctx.db.insert("deals", {
        offerId: getId(offerIds, offerIdx),
        businessId: getId(businessIds, offersData[offerIdx].businessIdx),
        creatorId: getId(creatorIds, creatorIdx % creatorIds.length),
        state: "completed",
        stateUpdatedAt: completedAt,
        stateHistory: [
          {
            fromState: "applied",
            toState: "approved",
            trigger: "business_approve",
            actor: "business",
            timestamp: completedAt - 10 * day,
          },
          {
            fromState: "business_reviewed",
            toState: "completed",
            trigger: "settle",
            actor: "system",
            timestamp: completedAt,
          },
        ],
        contractTerms: contractTerms(offerIdx),
        scheduledDate: completedAt - 5 * day,
        appliedAt: completedAt - 12 * day,
        approvedAt: completedAt - 10 * day,
        checkedInAt: completedAt - 5 * day,
        checkinMethod: "geofence",
        businessConfirmedArrival: true,
        contentUrls: [
          `https://www.instagram.com/p/seed_content_${i}/`,
        ],
        contentSubmittedAt: completedAt - 3 * day,
        contentVerifiedAt: completedAt - 2 * day,
        businessReviewedAt: completedAt - 1 * day,
        businessReviewAction: "approved",
        completedAt,
        businessRating: {
          contentQuality: 4 + Math.round(Math.random()),
          professionalism: 4 + Math.round(Math.random()),
          wouldWorkAgain: true,
          comment: "Great content, would work with again.",
          submittedAt: completedAt + 1 * day,
        },
        creatorRating: {
          experienceQuality: 4 + Math.round(Math.random()),
          offerAccuracy: 5,
          staffFriendliness: 5,
          comment: "Amazing experience, exactly as described.",
          submittedAt: completedAt + 1 * day,
        },
        commitmentDeposit: { required: false, amount: 0, status: "none" },
        platformFee: {
          amount: fee(offersData[offerIdx].barterRetailValue).amount,
          status: "charged",
        },
        createdAt: completedAt - 12 * day,
        updatedAt: completedAt,
      });
    }

    // 1 expired
    await ctx.db.insert("deals", {
      offerId: getId(offerIds, 1),
      businessId: getId(businessIds, 0),
      creatorId: getId(creatorIds, 0),
      state: "expired",
      stateUpdatedAt: now - 10 * day,
      stateHistory: [
        {
          fromState: "content_pending",
          toState: "expired",
          trigger: "content_window_expired",
          actor: "system",
          timestamp: now - 10 * day,
        },
      ],
      contractTerms: contractTerms(1),
      scheduledDate: now - 14 * day,
      appliedAt: now - 18 * day,
      approvedAt: now - 16 * day,
      checkedInAt: now - 14 * day,
      checkinMethod: "code",
      businessConfirmedArrival: true,
      commitmentDeposit: {
        required: true,
        amount: 10,
        status: "charged",
      },
      platformFee: { amount: 15, status: "waived" },
      createdAt: now - 18 * day,
      updatedAt: now - 10 * day,
    });

    // 1 unfulfilled
    await ctx.db.insert("deals", {
      offerId: getId(offerIds, 2),
      businessId: getId(businessIds, 1),
      creatorId: getId(creatorIds, 1),
      state: "unfulfilled",
      stateUpdatedAt: now - 8 * day,
      stateHistory: [
        {
          fromState: "expired",
          toState: "unfulfilled",
          trigger: "grace_period_expired",
          actor: "system",
          timestamp: now - 8 * day,
        },
      ],
      contractTerms: contractTerms(2),
      scheduledDate: now - 15 * day,
      appliedAt: now - 20 * day,
      approvedAt: now - 18 * day,
      checkedInAt: now - 15 * day,
      checkinMethod: "geofence",
      businessConfirmedArrival: true,
      commitmentDeposit: {
        required: true,
        amount: 10,
        status: "charged",
      },
      platformFee: { amount: 20, status: "waived" },
      createdAt: now - 20 * day,
      updatedAt: now - 8 * day,
    });

    // ============================================================
    // ATTRIBUTION CODES (for completed deals)
    // ============================================================
    // Create attribution codes for the 4 completed deals + the content_verified deal
    const allDeals = await ctx.db.query("deals").collect();
    const approvedOrCompletedDeals = allDeals.filter(
      (d) => ["completed", "content_verified", "business_reviewed"].includes(d.state)
    );

    let attributionCount = 0;
    for (const deal of approvedOrCompletedDeals) {
      const creator = await ctx.db.get(deal.creatorId);
      const creatorUser = creator ? await ctx.db.get(creator.userId) : null;
      const business = await ctx.db.get(deal.businessId);
      if (!creator || !creatorUser || !business) continue;

      const initials = creatorUser.name
        .split(" ")
        .map((w: string) => w[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 3);
      const bizShort = business.name
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase()
        .slice(0, 6);
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `${initials}-${bizShort}-${rand}`;

      const redemptions = deal.state === "completed" ? Math.floor(Math.random() * 12) + 1 : 0;
      const codeId = await ctx.db.insert("attributionCodes", {
        dealId: deal._id,
        businessId: deal.businessId,
        creatorId: deal.creatorId,
        offerId: deal.offerId,
        code,
        codeType: "promo",
        scans: 0,
        redemptions,
        estimatedRevenue: redemptions * (15 + Math.floor(Math.random() * 30)),
        isActive: true,
      });

      await ctx.db.patch(deal._id, { attributionCodeId: codeId });
      attributionCount++;
    }

    // ============================================================
    // CONTENT ARCHIVES (for completed deals)
    // ============================================================
    const completedDeals = allDeals.filter((d) => d.state === "completed");
    let archiveCount = 0;
    for (const deal of completedDeals) {
      const urls = deal.contentUrls ?? [`https://instagram.com/p/seed_${deal._id}`];
      for (const url of urls) {
        await ctx.db.insert("contentArchives", {
          dealId: deal._id,
          businessId: deal.businessId,
          creatorId: deal.creatorId,
          platform: "instagram",
          contentType: deal.contractTerms.deliverables[0]?.type ?? "reel",
          originalUrl: url,
          isStillLive: true,
          lastCheckedAt: now,
          archivedAt: deal.completedAt ?? now,
          businessVisible: true,
          businessDownloaded: false,
          usageRights: {
            canRepostSocial: true,
            canUseWebsite: true,
            canUseAds: deal.contractTerms.contentTier >= 3,
          },
          contentCategory: "food_photo",
          engagementRate: 0.03 + Math.random() * 0.04,
          impressions: Math.floor(Math.random() * 5000) + 500,
        });
        archiveCount++;
      }
    }

    return `Seeded: ${businessData.length} businesses, ${creatorData.length} creators, ${offersData.length} offers, 15 deals, ${attributionCount} attribution codes, ${archiveCount} content archives`;
  },
});
