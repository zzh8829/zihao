+++
categories = ["macOS"]
date = "2017-06-17T01:14:08-04:00"
description = "Fix Dirty ExFAT Partition on macOS"
tags = ["macOS", "file system"]
title = "Fix Dirty ExFAT Partition on macOS"

+++

macOS has a very dumb ExFAT driver, it often mark ExFAT formatted hard drive dirty and takes forever to clean them. So I dug into the internal of ExFAT format and fix this once for all.
<!--more-->

## My Hard Drive is Not Working

EVERY SINGLE TIME when I plugging my portable hard drive, my mac does absolutely NOTHING. No notification, no warning, no pop-up, no anything. The culprit is this fsck_exfat process.

[fsck_exfat]()

What really happened here was the system marked my hard drive as dirty (potentially corrupted). So when I plugged it in, `fsck_exfat` was checking for errors and attempting to repair them. But in reality, nothing is wrong 99.999% of times and hours of my time is wasted for it to finish scanning terabytes of data.

## Can I Skip the Check

If we know this check is mostly useless, can we skip it? Unfortunately not on macOS, there is no option to skip the `fsck` process, but on Windows it is skipped by default unless the user initiate the check. Now let's go through the mechanism of dirty flag on ExFAT file system.

## ExFAT Volume Boot Record

ExFAT format has a Volume Boot Record header containing information about the disk partition. Since ExFAT is a Microsoft creation, naturally there isn't any documentation (thanks M$). Fortunately enough, people already [reverse engineered](http://www.sans.org/reading-room/whitepapers/forensics/reverse-engineering-microsoft-exfat-file-system-33274) the entire header format.

```C++
struct __attribute__((__packed__)) exfat_vbr
{
  uint8_t jump_boot[3];
  uint8_t file_system_name[8];
  uint8_t zero[53];
  uint64_t partition_offset;
  uint64_t volume_length;
  uint32_t fat_offset;
  uint32_t fat_length;
  uint32_t cluster_heap_offset;
  uint32_t cluster_count;
  uint32_t root_dir_first_cluster;
  uint32_t volume_serial_number;
  struct
  {
    uint8_t minor;
    uint8_t major;
  } file_system_revision;
  struct
  {
    uint16_t active_fat:1;
    uint16_t volume_dirty:1;
    uint16_t media_failure:1;
    uint16_t zero:1;
    uint16_t reserved:12;
  } volume_flags;
  uint8_t bytes_per_sector;
  uint8_t sector_per_cluster;
  uint8_t fats_count;
  uint8_t drive_select;
  uint8_t percent_in_use;
  uint8_t reserved[7];
  uint8_t boot_code[390];
  uint16_t boot_signature;
};

```

The variable names are pretty self-explanatory, this header contains varies offsets, lengths, versions and some other information. Our interest is the `volume_dirty` bit under `volume_flags`. macOS often marks `volume_dirty` flag unnecessarily and refuse to set it to 0 without scanning the entire disk. If you are comfortable with hex editing, you can fix this by setting the 106th bit 0. If you don't want to accidentally nuke your hard drive by hex editing, you can use [this C++ program](https://github.com/zzh8829/exfat_clean) I created to automate the process. The instruction is in the repository :)



