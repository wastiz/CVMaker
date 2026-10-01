import type { Metadata } from "next";
import {
  BulletList,
  Compare,
  GuideCta,
  GuideHeader,
  GuideSection,
  GuideTable,
  GuideToc,
  Quote,
  SubHeading,
  Tip,
} from "@/components/guides/GuideParts";

export const metadata: Metadata = {
  title: "How to write a cover letter — CV Maker",
  description:
    "A step-by-step method for writing a cover letter: analyse the job description, match your experience, explain why the company, and structure the letter.",
};

const SECTIONS = [
  { id: "analyze", title: "Analyse the job description" },
  { id: "match", title: "Match your experience to the requirements" },
  { id: "why", title: "Find out why you want to work there" },
  { id: "structure", title: "Write the letter" },
  { id: "example", title: "Putting it together" },
];

const STORY_THEMES = [
  "Leading people",
  "Taking initiative",
  "Liking hard problems",
  "Liking a variety of work",
  "Interest in one specific kind of work",
  "Dealing with failure",
  "Managing conflict",
  "Driven by curiosity",
];

export default function CoverLetterGuidePage() {
  return (
    <article className="space-y-12">
      <GuideHeader
        eyebrow="Guide"
        title="How to write a cover letter"
        lead={
          <>
            Most people write a cover letter about themselves. A good one is really about the employer. Treat it as a
            pitch that shows how you solve <em>their</em> problems, not as a short autobiography.
          </>
        }
      />

      <GuideToc items={SECTIONS} />

      <GuideSection id="analyze" number={1} title={SECTIONS[0].title}>
        <p>
          Write each cover letter from scratch. Five well-researched applications will get you further than fifty
          generic ones, and the research starts with the job ad itself.
        </p>
        <p>Most job descriptions have two parts:</p>
        <BulletList
          items={[
            <><strong>What you&rsquo;ll do</strong>: the responsibilities. The first few bullets usually matter most to the team. Mark the ones you&rsquo;ve already done.</>,
            <><strong>What they&rsquo;re looking for</strong>: the qualifications. Mark the ones you clearly meet, including any &ldquo;nice to have&rdquo; items. Skip the ones you don&rsquo;t meet.</>,
          ]}
        />
        <Tip>
          Requirements are a wish list, not a hard filter. If you meet most of them, apply anyway.
        </Tip>
      </GuideSection>

      <GuideSection id="match" number={2} title={SECTIONS[1].title}>
        <p>
          Make a two-column table. On the left, write the requirements you marked. On the right, write concrete proof
          from your experience that you meet each one. Don&rsquo;t worry about wording yet: this is raw material.
        </p>
        <GuideTable
          head={["They want", "I can show"]}
          rows={[
            [
              "Experience building REST APIs with Spring Boot",
              "Built and maintain the order API at Acme: 40 endpoints, ~2M requests/day",
            ],
            [
              "Performance optimisation",
              "Cut p95 latency from 900 to 180 ms with Redis caching and query rewrites",
            ],
            [
              "Mentoring junior developers",
              "Onboarded 3 juniors and introduced code review guidelines for the team",
            ],
          ]}
        />
        <BulletList
          items={[
            <>Use the employer&rsquo;s words. If the ad says &ldquo;Kubernetes&rdquo;, write &ldquo;Kubernetes&rdquo;, not &ldquo;container orchestration&rdquo;.</>,
            "You don't need proof for every line. You'll only use the two strongest matches in the letter.",
            "Stuck? Ask former colleagues which projects they remember working on with you, or keep a running list of your wins at work so you have it ready next time.",
          ]}
        />
      </GuideSection>

      <GuideSection id="why" number={3} title={SECTIONS[2].title}>
        <p>
          Showing you fit the role is half the job. The other half is showing that you actually want <em>this</em>{" "}
          job. That comes down to research. Find answers to these questions:
        </p>
        <BulletList
          items={[
            "What is the company's mission, and what problem does it solve?",
            "What is the product, and who uses it?",
            "What makes it different from its competitors?",
            "Which values or policies does it highlight on its website?",
            "Does it run community projects, open source work or learning programmes?",
          ]}
        />
        <p>
          Interviews with the founders, the engineering blog and recent news are the best sources. Then write down{" "}
          <em>why</em> each answer appeals to you personally. If you already use their product, that&rsquo;s your
          strongest reason. Put it first.
        </p>
      </GuideSection>

      <GuideSection id="structure" number={4} title={SECTIONS[3].title}>
        <p>The letter has five parts and should fit on one page (roughly 250–400 words).</p>

        <SubHeading>1. Who you are, what you want, what you believe in</SubHeading>
        <p>
          One or two opening sentences. Lead with your strengths and, ideally, mention something specific to the
          company.
        </p>
        <Quote>
          I&rsquo;m a backend developer who believes good infrastructure should be invisible to the people who rely on
          it. That&rsquo;s why your work on making payments in the Baltics just work caught my attention.
        </Quote>

        <SubHeading>2. Transition</SubHeading>
        <p>
          A one-sentence summary of what you bring, followed by a line that leads into your examples. Skip the jargon
          and be specific: use half the words and twice the examples, with a number or two if you can.
        </p>
        <Compare
          weak={<p>I have strong technical skills and a lot of experience working in agile teams.</p>}
          strong={
            <p>
              Over the last three years I&rsquo;ve built and scaled the services behind Acme&rsquo;s checkout, which now
              handles 2M requests a day. Two things make me a strong fit for this role:
            </p>
          }
        />
        <Tip>The same summary sentence works well at the top of your LinkedIn profile.</Tip>

        <SubHeading>3. Two skill matches</SubHeading>
        <p>
          Take the two strongest rows from your table. To make each one more than a bullet point, link it to a theme
          that shows what kind of person you are:
        </p>
        <div className="flex flex-wrap gap-2">
          {STORY_THEMES.map((theme) => (
            <span key={theme} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {theme}
            </span>
          ))}
        </div>
        <p>
          Then write each paragraph as: <strong>theme → what you did → the result → how that helps them</strong>.
        </p>
        <Compare
          weak={<p>I have experience with performance optimisation.</p>}
          strong={
            <p>
              First, I like hard problems. When our checkout slowed down during sales peaks, I traced it to four heavy
              queries, rewrote them and added a caching layer, cutting response times by 80%. I&rsquo;d bring the same
              approach to scaling your API.
            </p>
          }
        />

        <SubHeading>4. Why this company</SubHeading>
        <p>
          Pick your two favourite findings from the research, ideally one about the company&rsquo;s values and one
          about what it&rsquo;s working on right now. A simple template:
        </p>
        <Quote>
          I&rsquo;ve followed [Company] for a while, and [value] stands out to me because [your reason]. I also read
          that [recent news or project], which appeals to me because [why it matters to you].
        </Quote>
        <p>
          If you can&rsquo;t think of anything here, ask yourself whether you really want this job.
        </p>

        <SubHeading>5. Conclusion</SubHeading>
        <p>Say clearly what you want and thank them. Keep it short.</p>
        <Quote>
          I believe my experience fits this role well, and I&rsquo;d love to bring it to your team. I look forward to
          hearing from you.
          <br />
          Best regards,
          <br />
          Jane Doe
        </Quote>
      </GuideSection>

      <GuideSection id="example" number={5} title={SECTIONS[4].title}>
        <p>A full letter built with this structure:</p>
        <div className="space-y-3 rounded-xl bg-card p-6 text-sm leading-relaxed ring-1 ring-foreground/10">
          <p>Dear Maria,</p>
          <p>
            I&rsquo;m a backend developer who believes good infrastructure should be invisible to the people who rely
            on it, which is exactly what drew me to Northpay&rsquo;s work on instant payments across the Baltics.
          </p>
          <p>
            Over the last three years I&rsquo;ve built and scaled the services behind Acme&rsquo;s checkout, which now
            handles 2M requests a day. Two things make me a strong fit for this role:
          </p>
          <p>
            First, I like hard problems. When our checkout slowed down during sales peaks, I traced it to four heavy
            queries, rewrote them and added Redis caching, cutting p95 latency from 900 to 180 ms. I&rsquo;d bring the
            same approach to scaling your payment API.
          </p>
          <p>
            Second, I enjoy helping people grow. I onboarded three junior developers and wrote the code review
            guidelines our team still uses, which shortened our review cycle by a day on average.
          </p>
          <p>
            I&rsquo;ve used Northpay as a customer for two years, and your public engineering blog, especially the
            post on zero-downtime migrations, convinced me this is a team that cares about doing things properly.
          </p>
          <p>
            I believe my experience fits this role well, and I&rsquo;d love to bring it to your team. I look forward
            to hearing from you.
          </p>
          <p>
            Best regards,
            <br />
            Jane Doe
          </p>
        </div>
        <SubHeading>Quick rules</SubHeading>
        <BulletList
          items={[
            "Address a real person if you can find the recruiter's or hiring manager's name.",
            "One page maximum. Recruiters skim.",
            "Don't repeat your CV line by line. Pick two stories and tell them well.",
            "Write in the language of the job ad, and proofread before you send.",
          ]}
        />
      </GuideSection>

      <p className="text-xs text-muted-foreground">
        Method adapted from &ldquo;My Guide To Writing A Killer Cover Letter&rdquo; by{" "}
        <a href="https://www.careerfair.io" className="underline underline-offset-2 hover:text-foreground">
          careerfair.io
        </a>
        .
      </p>

      <GuideCta
        href="/cover-letters"
        title="Ready to write yours?"
        text="Draft your cover letter and export it as PDF or TXT."
        label="Open the cover letter editor"
      />
    </article>
  );
}
