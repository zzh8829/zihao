+++
title = "Calculating ETag for Objects in AWS S3"
description =  "Here is a simple write up on how the undisclosed etag checksum algorithms work"
tags = ["aws", "s3", "etag", "md5"]
categories = ["aws"]
date = 2019-01-17T09:59:48-05:00
+++

AWS Simple Storage Service (S3) provides one of the most friendly and performent object storage. The ETag metadata returned by S3 can be used to verify the integrity and save bandwith by skipping same files. Here is a simple write up on how the undisclosed etag checksum algorithms work.
<!--more-->

## MD5 Checksum

The first algorithm used by AWS S3 is the classic MD5 algorithm. In practice, this version of ETag is generated on small object and non-multipart uploaded objects. Etag in this form looks something like `0a3dbf3a768081d785c20b498b4abd24`. The calcuation of md5 checksum is very straight forward as shown below.

```Python
import hashlib
def md5_checksum(filename):
    m = hashlib.md5()
    with open(filename, 'rb') as f:
        for data in iter(lambda: f.read(1024 * 1024), ''):
            m.update(data)
    return m.hexdigest()
```

## S3 Checksum (Double MD5)

This algorithm is used by S3 on bigger or multipart files. Etag in this form looks like `ceb8853ddc5086cc4ab9e149f8f09c88-2`. The undisclosed algorithm used by AWS S3 is reversed engineered by [people on the internet](https://github.com/antespi/s3md5). The algorithm is basically a double layered MD5 checksum. We calculate the md5 checksum of each individual 8MB chunk and then calculate the md5 checksum of all the previous checksums concatenated together.

```Python
import hashlib
def etag_checksum(filename, chunk_size=8 * 1024 * 1024):
    md5s = []
    with open(filename, 'rb') as f:
        for data in iter(lambda: f.read(chunk_size), ''):
            md5s.append(hashlib.md5(data).digest())
    m = hashlib.md5("".join(md5s))
    return '{}-{}'.format(m.hexdigest(), len(md5s))
```

## Compare with S3 Object

In order to verify our download against S3 Object, we can perform this simple check. One important note is AWS S3 stores etag in quoted strings like `"checksum"`, so unquoting is needed.

```Python
import boto3

filename = "test.txt"
obj = boto3.resource("s3").Object("your-bucket", filename)

def etag_compare(filename, etag):
    et = etag[1:-1] # strip quotes
    if '-' in et and et == etag_checksum(filename):
        return True
    if '-' not in et and et == md5_checksum(filename):
        return True
    return False

print(etag_compare(filename, obj.e_tag))
```

From my limited testing, objects larger than 20MB usually come with the S3 etag algorithm and objects less than 5MB use the classic MD5 algorithm. For other sizes, the algorithm used depends on how and when the obejcts are uploaded. Nevertheless, we can find out which version of the checksum algortihm is used after uploading by checking the existence of `-` symbol in the etag.
