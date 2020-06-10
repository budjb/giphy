package com.budjb.hegiphy;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Restful controller that provides APIs to the Giphy API.
 */
@RestController
@RequestMapping("/giphy")
public class GiphyController {
    /**
     * Giphy API binding.
     */
    private final GiphyClient client;

    /**
     * Constructor.
     *
     * @param client Giphy client bean.
     */
    public GiphyController(GiphyClient client) {
        this.client = client;
    }

    /**
     * Performs a query against Giphy with the application's configured API key.
     *
     * @param q      Query term.
     * @param offset Page number.
     * @param limit  Maximum number of results.
     * @return A JSON structure with the raw Giphy API response.
     * @throws Exception When an underlying exception occurs.
     */
    @GetMapping(value = "/query", produces = "application/json")
    public String query(
        @RequestParam String q,
        @RequestParam(defaultValue = "0") int offset,
        @RequestParam(defaultValue = "25") int limit,
        @RequestParam(defaultValue = "G") String rating,
        @RequestParam(defaultValue = "en") String lang
    ) throws Exception {
        if (offset < 0) {
            offset = 0;
        }

        if (limit < 1) {
            limit = 1;
        }

        return client.search(q, offset, limit, rating, lang);
    }

    /**
     * Retrieves a list of trending images from Giphy.
     *
     * @param rating Rating of images to fetch.
     * @param c      Number of images to fetch.
     * @return a JSON structure containing trending Giphy images.
     * @throws Exception When an underlying exception occurs.
     */
    @GetMapping(value = "/trending", produces = "application/json")
    public String trending(
        @RequestParam(defaultValue = "G") String rating,
        @RequestParam(defaultValue = "25") int c
    ) throws Exception {
        if (c < 1) {
            c = 1;
        }

        return client.trending(c, rating);
    }

    /**
     * Returns the Giphy images associated with the given set of Giphy image IDs.
     *
     * @param ids IDs of the Giphy images to query for.
     * @return a JSON structure containing trending Giphy images.
     * @throws Exception When an underlying exception occurs.
     */
    @GetMapping(value = "/gifs", produces = "application/json")
    public String getByIds(@RequestParam() String ids) throws Exception {
        return client.getByIds(ids);
    }
}
