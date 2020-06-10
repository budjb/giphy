package com.budjb.hegiphy;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Restful controller that provides APIs to manage a logged-in user's
 * favorites collection for Giphy images.
 * <p>
 * Giphy images that have been marked as favorites may also have arbitrary
 * "tags" assigned to them that allow them to be organized into collections.
 */
@Validated
@RestController
@RequestMapping(value = "/favorites")
public class FavoritesController {
    /**
     * Favorites Mongo repository.
     */
    private final FavoriteRepository favoriteRepository;

    /**
     * Constructor.
     *
     * @param favoriteRepository Favorites Mongo repository.
     */
    public FavoritesController(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }

    /**
     * List all favorites belonging to the current user.
     * <p>
     * An optional tag may be supplied that will only return those
     * favorites that are tagged with the matching string.
     *
     * @param tag       An optional tag that, when provided in the request query,
     *                  will filter the result set so that only images with that
     *                  tag assigned will be returned.
     * @param principal The currently-logged in user.
     * @return A list of all favorites belonging to the current user.
     */
    @GetMapping(produces = "application/json")
    public List<Favorite> list(@RequestParam(value = "tag", required = false) String tag, @AuthenticationPrincipal Principal principal) {
        if (!StringUtils.isEmpty(tag)) {
            return favoriteRepository.findAllByUserAndTagsContains(principal.getName(), tag.toLowerCase());
        }
        else {
            return favoriteRepository.findAllByUser(principal.getName());
        }
    }

    /**
     * Returns the favorite instance corresponding to the given ID.
     * <p>
     * If the instance is not found or does not belong to the current user,
     * HTTP 404 is returned to the client.
     *
     * @param id        ID of the requested favorite instance.
     * @param principal The currently-logged in user.
     * @return The HTTP response to the request.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable("id") String id, @AuthenticationPrincipal Principal principal) {
        Optional<Favorite> result = favoriteRepository.findByGiphyIdAndUser(id, principal.getName());
        if (result.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return new ResponseEntity<>(result.get(), HttpStatus.OK);
    }

    /**
     * Deletes the favorite instances corresponding to the given ID.
     * <p>
     * If the instance is not found or does not belong to the current user,
     * HTTP 404 is returned to the client.
     *
     * @param id        ID of the requested favorite instance.
     * @param principal The currently-logged in user.
     * @return HTTP response to the request.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id, @AuthenticationPrincipal Principal principal) {
        Optional<Favorite> result = favoriteRepository.findByGiphyIdAndUser(id, principal.getName());
        if (result.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        favoriteRepository.delete(result.get());
        return ResponseEntity.noContent().build();
    }

    /**
     * Creates a new favorite instance for the current user.
     * <p>
     * Returns HTTP 201 CREATED on success.
     *
     * @param favorite  SDO containing the request entity.
     * @param principal The currently-logged in user.
     * @return The created favorite instance.
     */
    @PostMapping(consumes = "application/json")
    public Favorite add(@RequestBody Favorite favorite, @AuthenticationPrincipal Principal principal) {
        favorite.setUser(principal.getName());
        favorite.setTags(favorite.getTags().stream().map(String::toLowerCase).collect(Collectors.toSet()));

        return favoriteRepository.save(favorite);
    }

    /**
     * Adds a tag to an existing favorite Giphy image.
     * <p>
     * This API is idempotent; if the tag is already set it will not be duplicated.
     *
     * @param id        ID of the requested favorite instance.
     * @param tag       Tag to add to the favorite instance.
     * @param principal The currently-logged in user.
     * @return The updated favorite instance.
     */
    @PostMapping("/{id}/tags/{tag}")
    public ResponseEntity<?> addTag(@PathVariable("id") String id, @PathVariable String tag, @AuthenticationPrincipal Principal principal) {
        tag = tag.toLowerCase();

        Optional<Favorite> result = favoriteRepository.findByGiphyIdAndUser(id, principal.getName());
        if (result.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Favorite favorite = result.get();
        favorite.getTags().add(tag);
        favoriteRepository.save(favorite);

        return ResponseEntity.ok(favorite);
    }

    /**
     * Removes a tag from an existing favorite Giphy image.
     * <p>
     * This API is idempotent; if the tag is not assigned no action will occur.
     *
     * @param id        ID of the requested favorite instance.
     * @param tag       Tag to remove from the favorite instance.
     * @param principal The currently-logged in user.
     * @return The updated favorite instance.
     */
    @DeleteMapping("/{id}/tags/{tag}")
    public ResponseEntity<?> deleteTag(@PathVariable("id") String id, @PathVariable("tag") String tag, @AuthenticationPrincipal Principal principal) {
        tag = tag.toLowerCase();

        Optional<Favorite> result = favoriteRepository.findByGiphyIdAndUser(id, principal.getName());
        if (result.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Favorite favorite = result.get();
        favorite.getTags().remove(tag);
        favoriteRepository.save(favorite);

        return ResponseEntity.ok(favorite);
    }
}
