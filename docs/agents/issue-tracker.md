# Issue tracker: GitHub

Issues and specs live in GitHub Issues for Yorkshireman/gpsgoblin.
Use the gh CLI from this clone; it infers the repository from the remote.

Follow AGENTS.md authorization rules for mutations. Posting comments
or other messages requires explicit authorization.

## Operations

- Create: gh issue create --title "..." --body-file <file>
- Read: gh issue view <number> --comments
- Read labels: gh issue view <number> --json labels
- List: gh issue list --state open --json number,title,body,labels
- Comment: gh issue comment <number> --body-file <file>
- Label: gh issue edit <number> --add-label "..."
- Remove label: gh issue edit <number> --remove-label "..."
- Close: gh issue close <number>

For multiline bodies, write the exact text to a temporary file and
pass --body-file.

When a skill says "publish to the issue tracker", create a GitHub issue.
When it says "fetch the relevant ticket", read the issue and comments.

## Pull requests as a triage surface

**PRs as a request surface: no.**
