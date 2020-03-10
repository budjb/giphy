package com.budjb.hegiphy;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

/**
 * Represents a favorite Giphy image belonging to a user.
 */
public class Favorite {
    /**
     * Auto-generated ID of the document.
     */
    @Id
    private String id;

    /**
     * ID of the user the record belongs to.
     */
    @Indexed
    private String user;

    /**
     * ID of the Giphy image.
     */
    @NotEmpty
    @Indexed(unique = true)
    private String giphyId;

    /**
     * Set of tags associated with the image.
     */
    @NotNull
    private Set<String> tags = new HashSet<>();

    /**
     * Returns the auto-generated ID of the document.
     *
     * @return The auto-generated ID of the document.
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the auto-generated ID of the document.
     *
     * @param id The auto-generated ID of the document.
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Returns the ID of the user the record belongs to.
     *
     * @return The ID of the user the record belongs to.
     */
    public String getUser() {
        return user;
    }

    /**
     * Sets the ID of the user the record belongs to.
     *
     * @param user The ID of the user the record belongs to.
     */
    public void setUser(String user) {
        this.user = user;
    }

    /**
     * Returns the ID of the Giphy image.
     *
     * @return The ID of the Giphy image.
     */
    public String getGiphyId() {
        return giphyId;
    }

    /**
     * Sets the ID of the Giphy image.
     *
     * @param giphyId The ID of the Giphy image.
     */
    public void setGiphyId(String giphyId) {
        this.giphyId = giphyId;
    }

    /**
     * Returns the set of tags associated with the image.
     *
     * @return The set of tags associated with the image.
     */
    public Set<String> getTags() {
        return tags;
    }

    /**
     * Sets the set of tags associated with the image.
     *
     * @param tags The set of tags associated with the image.
     */
    public void setTags(Set<String> tags) {
        this.tags = tags;
    }
}
