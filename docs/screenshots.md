# Screenshots and recordings

Use this document to collect launch assets.

## Required screenshots

### 1. Website hero

Source:

```text
https://toolcapsule.studio
```

Placeholder:

```text
docs/assets/website-hero.png
```

### 2. Tool discovery

Command:

```bash
tcap tools feishu --brief
```

Placeholder:

```text
docs/assets/tcap-tools-brief.png
```

### 3. Saved run

Command:

```bash
tcap call feishu create-doc @args.json --save-run
```

Placeholder:

```text
docs/assets/saved-run.png
```

### 4. Patch and retry

Command:

```bash
tcap retry .toolcapsule/runs/feishu/<run-id>
```

Placeholder:

```text
docs/assets/patch-and-retry.gif
```

## Recording script

1. Show the website hero.
2. Open terminal.
3. Run `tcap tools <profile> --brief`.
4. Run a call with `--save-run`.
5. Patch `args.json`.
6. Run `tcap retry .toolcapsule/runs/feishu/<run-id>`.
7. End on the generated run directory and the ToolCapsule slogan.
