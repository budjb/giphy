package com.budjb.hegiphy;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

/**
 * A Spring Data MongoDB repository that manages access to {@link Favorite} documents.
 */
public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    /**
     * Finds and returns the favorite instance identified by the given document
     * ID and user.
     *
     * @param id   ID of the favorite document.
     * @param user User associated with the document.
     * @return An optional that may contain the matching favorite instance.
     */
    Optional<Favorite> findByGiphyIdAndUser(String id, String user);

    /**
     * Finds all favorite instance documents belonging to the given user.
     *
     * @param user User associated with the favorite documents.
     * @return A list of results. When no results are present, an empty list is returned.
     */
    List<Favorite> findAllByUser(String user);

    /**
     * Finds all favorite instance documents belong to the given user and matching
     * the given tag.
     *
     * @param user User associated with the favorite documents.
     * @param tag  Tag to filter results by.
     * @return A list of results. When no results are present, an empty list is returned.
     */
    List<Favorite> findAllByUserAndTagsContains(String user, String tag);
}
