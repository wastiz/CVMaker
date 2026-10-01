import type { Metadata } from "next";
import {
  BulletList,
  Checklist,
  Compare,
  GuideCta,
  GuideHeader,
  GuideSection,
  GuideTable,
  GuideToc,
  SubHeading,
  Tip,
} from "@/components/guides/GuideParts";

export const metadata: Metadata = {
  title: "How to write a resume — CV Maker",
  description:
    "A practical guide to writing an IT resume: contact details, work permit, summary, career track and achievement-focused experience.",
};

const SECTIONS = [
  { id: "basics", title: "Put every basic fact up front" },
  { id: "summary", title: "Write a specific summary" },
  { id: "career-track", title: "Keep the career track clear" },
  { id: "experience", title: "Describe what you achieved and how" },
  { id: "tailor", title: "Tailor it to every job" },
  { id: "skills-projects", title: "Skills and projects" },
  { id: "format", title: "Length, format and language" },
  { id: "checklist", title: "Final checklist" },
];

export default function ResumeGuidePage() {
  return (
    <article className="space-y-12">
      <GuideHeader
        eyebrow="Guide"
        title="How to write a resume"
        lead="A recruiter spends well under a minute on a first pass through your CV. Your job is to make that minute easy: every important fact where they expect it, and every line proving you can do the job."
      />

      <GuideToc items={SECTIONS} />

      <GuideSection id="basics" number={1} title={SECTIONS[0].title}>
        <p>
          A recruiter should never have to search for anything or write to you just to ask a basic question. If a fact
          could get you filtered out, or let you through, it belongs in the header.
        </p>
        <BulletList
          items={[
            <><strong>Full name</strong> and, optionally, the role you are targeting (e.g. &ldquo;Backend Developer&rdquo;).</>,
            <><strong>Email and phone</strong>, including the country code: <em>+372 5xxx xxxx</em>.</>,
            <><strong>Location</strong>: city and country. Add &ldquo;open to remote&rdquo; or &ldquo;open to relocation&rdquo; if that&rsquo;s true.</>,
            <><strong>Work permit status</strong>: &ldquo;EU citizen&rdquo;, &ldquo;EU work permit&rdquo;, &ldquo;Estonian residence permit&rdquo; or &ldquo;Requires visa sponsorship&rdquo;. If you leave it out, many recruiters will assume you need sponsorship and move on.</>,
            <><strong>Links</strong>: LinkedIn, GitHub and a portfolio, but only ones that are up to date and worth opening.</>,
            <><strong>Languages</strong> with an honest level (A1–C2 or Native). On the Estonian market, Estonian, English and Russian often decide who gets shortlisted.</>,
          ]}
        />
        <Tip>
          Leave out your date of birth, marital status and full home address. They don&rsquo;t help you, and they take
          space away from things that do. A photo is optional: it&rsquo;s common on cv.ee, but nobody will reject a
          developer CV for not having one.
        </Tip>
      </GuideSection>

      <GuideSection id="summary" number={2} title={SECTIONS[1].title}>
        <p>
          The summary is 2–3 sentences at the top that answer one question: <em>who are you professionally, and why
          should I keep reading?</em> Say what you specialise in, how long you&rsquo;ve done it, your core stack, and
          one or two of your biggest achievements.
        </p>
        <Compare
          weak={
            <p>
              Motivated and hard-working developer with a passion for technology. Team player who loves learning new
              things and is looking for new challenges.
            </p>
          }
          strong={
            <p>
              Backend developer with 4 years of experience building payment and billing services in Java and Spring
              Boot. Led the migration of a monolith to 6 services, cutting deploy time from 40 to 8 minutes.
            </p>
          }
        />
        <p>
          The weak version could describe anyone. The strong one tells the reader where you fit in a team and gives
          them something to ask about in the interview.
        </p>
      </GuideSection>

      <GuideSection id="career-track" number={3} title={SECTIONS[2].title}>
        <p>
          Someone reading your experience section should be able to tell your story in one sentence: &ldquo;started as a
          QA engineer, moved into automation, now a backend developer.&rdquo; Anything that doesn&rsquo;t help tell
          that story is noise.
        </p>
        <BulletList
          items={[
            "List positions in reverse chronological order, most recent first.",
            "Drop jobs that have nothing to do with the role. A summer at a café doesn't belong on a senior developer CV.",
            <>If leaving a job out would create a long gap, put it on one line with no details, e.g. <em>2019–2020 · Sales assistant, Prisma</em>.</>,
            "Give gaps longer than 6 months a short honest label (studies, relocation, freelance, parental leave) instead of hoping nobody notices.",
            "If you've had several short contracts with one client or agency, group them under a single heading.",
          ]}
        />
      </GuideSection>

      <GuideSection id="experience" number={4} title={SECTIONS[3].title}>
        <p>
          For every role, the reader wants three things: what you were <strong>responsible for</strong>, what you{" "}
          <strong>achieved</strong>, and <strong>how</strong> you did it. Responsibilities alone describe the job;
          achievements describe you.
        </p>
        <p>A simple formula for each bullet:</p>
        <Tip>
          <strong>Did [what]</strong> by <strong>[how — tools, approach]</strong>, which resulted in{" "}
          <strong>[measurable outcome]</strong>.
        </Tip>
        <Compare
          weak={
            <ul className="list-disc space-y-1 pl-4">
              <li>Worked on the backend.</li>
              <li>Responsible for REST APIs.</li>
              <li>Fixed bugs and wrote tests.</li>
            </ul>
          }
          strong={
            <ul className="list-disc space-y-1 pl-4">
              <li>Built the order API in Spring Boot used by 3 client apps, handling ~2M requests/day.</li>
              <li>Cut p95 response time from 900 to 180 ms by adding Redis caching and rewriting 4 heavy SQL queries.</li>
              <li>Raised test coverage from 35% to 80% and set up CI checks, reducing production incidents by half.</li>
            </ul>
          }
        />
        <SubHeading>No numbers? Measure something else</SubHeading>
        <p>
          Not every result fits a metric, but almost every one has scale or impact: how many users, how many teams,
          how much time saved, what became possible that wasn&rsquo;t before. &ldquo;Introduced code review, which the
          rest of the 8-person team adopted&rdquo; is still much stronger than &ldquo;did code reviews&rdquo;.
        </p>
        <BulletList
          items={[
            "3–5 bullets for recent roles, 1–2 for older ones.",
            "Start each bullet with a strong verb: built, led, reduced, migrated, automated, designed.",
            "List the stack per role so the reader can see which technologies you used recently.",
          ]}
        />
      </GuideSection>

      <GuideSection id="tailor" number={5} title={SECTIONS[4].title}>
        <p>
          One generic CV sent to fifty companies does worse than five CVs adjusted for five roles you actually want.
          Duplicate your CV and adjust it for each application:
        </p>
        <BulletList
          items={[
            "Use the same words as the job description. If it says \"PostgreSQL\", don't just write \"SQL databases\". Applicant tracking systems and recruiters both look for exact matches.",
            "Move the most relevant skills and bullets to the top.",
            "Rewrite the summary so it matches the role's main focus.",
          ]}
        />
      </GuideSection>

      <GuideSection id="skills-projects" number={6} title={SECTIONS[5].title}>
        <SubHeading>Skills</SubHeading>
        <BulletList
          items={[
            "Group skills by type (languages, frameworks, databases, tools) so they're easy to scan.",
            "Only list things you could comfortably discuss in an interview.",
            "Skip progress bars and \"Java 80%\" ratings. They don't tell the reader anything they can trust.",
            "Leave out things everyone is expected to know, such as MS Word or \"Internet\".",
          ]}
        />
        <SubHeading>Projects</SubHeading>
        <p>
          Projects matter most for juniors and career changers, but they help anyone. For each one, say what it
          does, what <em>you</em> built, the stack, and give a working link.
        </p>
        <GuideTable
          head={["Weak project entry", "Strong project entry"]}
          rows={[
            [
              "Todo app — React, Node.js",
              "Shared shopping list with real-time sync (React, Node.js, WebSockets). ~150 weekly users; built auth and offline mode. github.com/…",
            ],
          ]}
        />
      </GuideSection>

      <GuideSection id="format" number={7} title={SECTIONS[6].title}>
        <BulletList
          items={[
            <><strong>Length:</strong> one page for up to ~5 years of experience, two pages at most after that.</>,
            <><strong>Language:</strong> write the CV in the language of the job ad. An English ad gets an English CV.</>,
            <><strong>Dates:</strong> use one format throughout, e.g. <em>Jan 2022 – Present</em>.</>,
            <><strong>File:</strong> send a PDF named <em>Firstname_Lastname_CV.pdf</em>, not <em>cv_final_v3.pdf</em>.</>,
            <><strong>Design:</strong> a clean template beats a creative one. Fancy layouts often break when ATS software parses them.</>,
          ]}
        />
      </GuideSection>

      <GuideSection id="checklist" number={8} title={SECTIONS[7].title}>
        <Checklist
          items={[
            "Contact details, location and work permit status are in the header",
            "Language levels are listed",
            "The summary says what I specialise in and includes at least one concrete achievement",
            "The career track is easy to follow, with no irrelevant jobs",
            "Every recent role has achievements, not just duties",
            "Keywords from the job description appear in the CV",
            "All links open and are up to date",
            "No typos — I read it out loud once",
          ]}
        />
      </GuideSection>

      <GuideCta
        href="/resumes"
        title="Ready to write yours?"
        text="Create a CV, pick a template and export it as PDF."
        label="Open the CV editor"
      />
    </article>
  );
}
