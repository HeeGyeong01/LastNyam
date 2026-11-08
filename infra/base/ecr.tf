resource "aws_ecr_repository" "app" {
  for_each = toset(["customer", "owner", "foocketing-publisher", "foocketing-subscriber"])

  name                 = "lastnyam/${each.key}"
  image_tag_mutability = "IMMUTABLE" # 태그 = 커밋 해시, 덮어쓰기 금지

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  for_each   = aws_ecr_repository.app
  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "최근 10개만 유지"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}
