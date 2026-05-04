/**
 * Seed script — populates MongoDB with sample data.
 * Run with:  npm run seed
 *
 * WARNING: This will wipe and re-create Portfolio, CaseStudy,
 *          Testimonial, and Admin collections.
 */
require('dotenv').config()
const mongoose        = require('mongoose')
const { connectDB }   = require('../config/db')
const PortfolioProject = require('../models/PortfolioProject')
const CaseStudy       = require('../models/CaseStudy')
const Testimonial     = require('../models/Testimonial')
const Admin           = require('../models/Admin')
const logger          = require('./logger')

/* ── Seed data ─────────────────────────────────────────────── */
const portfolioSeed = [
  {
    industry: 'E-Commerce',
    year: '2024',
    title: 'Fashion Brand Scale-Up',
    objective: 'Increase online sales and build brand awareness for a mid-size fashion label entering new markets.',
    gradient: 'linear-gradient(145deg, #2d0a5e 0%, #5c18b8 100%)',
    results: [{ value: '340%', label: 'Sales Growth' }, { value: '2.1M', label: 'Reach' }],
    featured: true,
    order: 1,
  },
  {
    industry: 'Hospitality',
    year: '2024',
    title: 'Boutique Hotel Social Presence',
    objective: 'Build an engaged social audience and drive direct bookings through Instagram and Facebook campaigns.',
    gradient: 'linear-gradient(145deg, #1a0533 0%, #420f8a 100%)',
    results: [{ value: '2.4M', label: 'Impressions' }, { value: '180%', label: 'Bookings Up' }],
    featured: true,
    order: 2,
  },
  {
    industry: 'Technology',
    year: '2024',
    title: 'SaaS Lead Generation Campaign',
    objective: 'Generate qualified B2B leads for a project management SaaS tool targeting SMEs.',
    gradient: 'linear-gradient(145deg, #420f8a 0%, #7b2ff7 100%)',
    results: [{ value: '1.2K', label: 'Leads' }, { value: '$28', label: 'Cost/Lead' }],
    featured: true,
    order: 3,
  },
  {
    industry: 'Food & Beverage',
    year: '2023',
    title: 'Restaurant Chain Social Launch',
    objective: 'Launch social media presence for a new restaurant chain across 3 cities simultaneously.',
    gradient: 'linear-gradient(145deg, #0d0120 0%, #2d0a5e 100%)',
    results: [{ value: '50K', label: 'Followers' }, { value: '4.2%', label: 'Engagement' }],
    order: 4,
  },
  {
    industry: 'Real Estate',
    year: '2023',
    title: 'Property Developer Lead System',
    objective: 'Build an automated lead generation system for luxury property developers targeting HNWIs.',
    gradient: 'linear-gradient(145deg, #2d0a5e 0%, #1a0533 100%)',
    results: [{ value: '89', label: 'Qualified Leads' }, { value: '$320K', label: 'Pipeline Value' }],
    order: 5,
  },
  {
    industry: 'Healthcare',
    year: '2023',
    title: 'Wellness Brand Awareness Drive',
    objective: 'Establish brand authority for a wellness clinic and drive appointment bookings.',
    gradient: 'linear-gradient(145deg, #5c18b8 0%, #7b2ff7 100%)',
    results: [{ value: '220%', label: 'Appt Growth' }, { value: '4.8★', label: 'Reputation' }],
    order: 6,
  },
]

const caseStudySeed = [
  {
    industry: 'E-Commerce',
    service: 'Done-For-You Marketing',
    title: 'How a Fashion Brand Grew Sales by 340% in 6 Months',
    metrics: [
      { value: '340%', label: 'Revenue Growth' },
      { value: '2.1M', label: 'Campaign Reach' },
      { value: '4.2%', label: 'Conversion Rate' },
    ],
    background: 'A mid-size fashion label with a passionate following but stagnant online revenue.',
    problem: 'Inconsistent social media presence, variable content quality, and no coherent paid ad funnel.',
    strategy: 'Rebuilt the entire digital marketing funnel — content calendar, ad creative, retargeting strategy, and lead nurture sequence.',
    execution: '3-phase campaign: brand awareness through Reels, engagement campaigns, conversion campaigns with A/B tested creatives.',
    results: [
      { number: '340%', desc: 'Increase in online sales' },
      { number: '2.1M', desc: 'Total campaign reach' },
      { number: '4.2%', desc: 'Conversion rate achieved' },
      { number: '62%',  desc: 'Reduction in cost-per-acquisition' },
    ],
    featured: true,
    order: 1,
  },
  {
    industry: 'Technology',
    service: 'Lead Generation',
    title: '1,200 Qualified B2B Leads in 60 Days for a SaaS Company',
    metrics: [
      { value: '1,200', label: 'Leads Generated' },
      { value: '$28',   label: 'Cost Per Lead' },
      { value: '28%',   label: 'Lead-to-Trial Rate' },
    ],
    background: 'A project management SaaS startup needed to fill their sales pipeline for a Series A pitch.',
    problem: 'Zero organic social presence, no content strategy, complex value propositions.',
    strategy: 'LinkedIn-focused lead generation with targeted Facebook campaigns and lead magnets.',
    execution: '20+ educational content pieces, LinkedIn campaigns targeting decision-makers, Facebook lead ads with A/B tested landing pages.',
    results: [
      { number: '1,200', desc: 'Qualified leads captured' },
      { number: '$28',   desc: 'Average cost per lead' },
      { number: '28%',   desc: 'Free trial conversion rate' },
      { number: '336',   desc: 'Trial users in 60 days' },
    ],
    featured: true,
    order: 2,
  },
  {
    industry: 'Hospitality',
    service: 'Social Media Management',
    title: 'Boutique Hotel Grows Direct Bookings by 180% Through Social',
    metrics: [
      { value: '180%', label: 'Bookings Growth' },
      { value: '2.4M', label: 'Total Impressions' },
      { value: '15K',  label: 'New Followers' },
    ],
    background: 'A boutique hotel heavily dependent on OTA platforms taking 18-22% commission.',
    problem: 'No coherent social strategy, inconsistent posting, low-quality photography, no direct booking mechanism.',
    strategy: 'Positioned the hotel as a lifestyle destination. Built direct booking incentives for social followers.',
    execution: 'Professional content shoots, daily Stories, influencer partnerships with 8 travel creators, "Social Exclusive" monthly offers.',
    results: [
      { number: '180%', desc: 'Direct bookings increase' },
      { number: '2.4M', desc: 'Impressions delivered' },
      { number: '15K',  desc: 'New social followers' },
      { number: '40%',  desc: 'Reduction in OTA dependency' },
    ],
    featured: true,
    order: 3,
  },
]

const testimonialSeed = [
  {
    name: 'Sarah M.',
    role: 'CEO',
    company: 'TechVenture Co.',
    text: 'Mawkish Creates transformed our entire digital presence. Their lead generation system brought us over 400 qualified prospects in the first month alone.',
    rating: 5,
    initial: 'S',
    featured: true,
    order: 1,
  },
  {
    name: 'James K.',
    role: 'Founder',
    company: 'Retail Brand',
    text: 'The team at Mawkish Creates truly understands marketing at a deep level. Our social media following grew 600% and so did our revenue.',
    rating: 5,
    initial: 'J',
    featured: true,
    order: 2,
  },
  {
    name: 'Priya L.',
    role: 'Marketing Director',
    company: 'Hospitality Group',
    text: 'Working with Mawkish Creates was the best investment we made. Professional, strategic, and results-driven from day one.',
    rating: 5,
    initial: 'P',
    featured: true,
    order: 3,
  },
]

const adminSeed = {
  name:     'Admin',
  email:    'admin@mawkishcreates.com',
  password: 'Admin@1234!',  // Change this immediately after first login
  role:     'superadmin',
}

/* ── Run seed ──────────────────────────────────────────────── */
const seed = async () => {
  await connectDB()

  try {
    logger.info('Clearing existing data...')
    await Promise.all([
      PortfolioProject.deleteMany({}),
      CaseStudy.deleteMany({}),
      Testimonial.deleteMany({}),
      Admin.deleteMany({}),
    ])

    logger.info('Seeding portfolio projects...')
    await PortfolioProject.insertMany(portfolioSeed)

    logger.info('Seeding case studies...')
    await CaseStudy.insertMany(caseStudySeed)

    logger.info('Seeding testimonials...')
    await Testimonial.insertMany(testimonialSeed)

    logger.info('Creating default admin...')
    await Admin.create(adminSeed)

    logger.info('✅  Seed complete!')
    logger.info(`Admin login: ${adminSeed.email} / ${adminSeed.password}`)
    logger.info('⚠️  Change the admin password immediately after first login!')
  } catch (err) {
    logger.error(`Seed failed: ${err.message}`)
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

seed()
