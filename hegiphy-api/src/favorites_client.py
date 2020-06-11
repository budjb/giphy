import boto3
import config

client = boto3.client("dynamodb")


class FavoriteNotFoundException(Exception):
    pass


class FavoritesClient:
    def _format(self, record):
        return {
            "id": record["sk"]["S"],
            "user": record["pk"]["S"],
            "tags": record.get("tags", {}).get("SS", []),
        }

    def find_by_id_and_user(self, id, user):
        response = client.query(
            TableName=config.get("dynamodb_table"),
            KeyConditionExpression="pk = :user AND sk = :id",
            ExpressionAttributeValues={":user": {"S": user}, ":id": {"S": id}},
        )

        if len(response["Items"]) == 0:
            return None

        return self._format(response["Items"][0])

    def find_by_user(self, user):
        response = client.query(
            TableName=config.get("dynamodb_table"),
            KeyConditionExpression="pk = :user",
            ExpressionAttributeValues={":user": {"S": user}},
        )

        return [self._format(it) for it in response["Items"]]

    def find_by_user_and_tag(self, user, tag):
        tag = tag.lower()
        favorites = self.find_by_user(user)
        return list(filter(lambda it: tag in it.tags, favorites))

    def create_favorite(self, user, favorite):
        id = favorite["id"]
        tags = favorite.get("tags", [])

        item = {"pk": {"S": user}, "sk": {"S": id}}

        if tags:
            item["tags"] = tags

        client.put_item(TableName=config.get("dynamodb_table"), Item=item)

        return {"id": id, "user": user, "tags": tags}

    def delete_favorite(self, user, id):
        client.delete_item(
            TableName=config.get("dynamodb_table"),
            Key={"pk": {"S": user}, "sk": {"S": id}},
            ReturnValues="NONE",
        )

    def add_tag_to_favorite(self, id, user, tag):
        record = self.find_by_id_and_user(id, user)

        if not record:
            raise FavoriteNotFoundException()

        tags = record.get("tags", [])

        if tag in tags:
            return record

        tags.append(tag)

        result = client.update_item(
            TableName=config.get("dynamodb_table"),
            Key={"pk": {"S": user}, "sk": {"S": id}},
            UpdateExpression="set #tags = :tags",
            ExpressionAttributeValues={":tags": {"SS": tags}},
            ExpressionAttributeNames={"#tags": "tags"},
            ReturnValues="ALL_NEW",
        )

        return self._format(result["Attributes"])

    def remove_tag_from_favorite(self, id, user, tag):
        record = self.find_by_id_and_user(id, user)

        if not record:
            raise FavoriteNotFoundException()

        tags = record.get("tags", [])

        if tag not in tags:
            return record

        tags.remove(tag)

        if len(tags) > 0:
            result = client.update_item(
                TableName=config.get("dynamodb_table"),
                Key={"pk": {"S": user}, "sk": {"S": id}},
                UpdateExpression="SET #tags = :tags",
                ExpressionAttributeValues={":tags": {"SS": tags}},
                ExpressionAttributeNames={"#tags": "tags"},
                ReturnValues="ALL_NEW",
            )
        else:
            result = client.update_item(
                TableName=config.get("dynamodb_table"),
                Key={"pk": {"S": user}, "sk": {"S": id}},
                UpdateExpression="REMOVE #tags",
                ExpressionAttributeNames={"#tags": "tags"},
                ReturnValues="ALL_NEW",
            )

        return self._format(result["Attributes"])
