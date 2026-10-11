# Practical record schema

Main catalogue records live in `entries.json`. Required values: `id`, `slug`, `track`, `category`, `title`, `summary`, `scenario`, `source_title`, `source_url`, `scope`, `procedure`, `expected`, `defense`, `verification`, `independent_product_verification`, `command`, `tested_environment`.

`verification` refers **only** to execution of the local offline fixture. Never present it as an independently reproduced exploit on a real model, vendor product or hosted service.

`research_queue.json` is editorial backlog data and is not loaded on the public website.
