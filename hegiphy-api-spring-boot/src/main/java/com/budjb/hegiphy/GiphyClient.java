package com.budjb.hegiphy;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * A simple API binding that exposes various endpoints from the Giphy service.
 */
@Component
public class GiphyClient {
    /**
     * Configured base URI for Giphy.
     */
    @Value("${giphy.base-uri}")
    private URI baseUri;

    /**
     * Configured API key for Giphy.
     */
    @Value("${giphy.api-key}")
    private String apiKey;

    /**
     * Performs a search of the Giphy image database with the given search term.
     *
     * @param term   Search term to search Giphy with.
     * @param offset The number of results to offset.
     * @param limit  The maximum number of results to return.
     * @param rating The rating to limit the result set to (e.g, "G", "PG", etc).
     * @param lang   The language ID to limit the result set to.
     * @return The unmodified API response (JSON in string form).
     * @throws InterruptedException When the API request has been interrupted.
     * @throws HttpStatusException  When the API returns an unsuccessful HTTP status.
     * @throws IOException          When an underlying IO error occurs.
     */
    public String search(@NonNull String term, int offset, int limit, String rating, String lang) throws InterruptedException, HttpStatusException, IOException {
        UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromUri(baseUri);
        uriComponentsBuilder.pathSegment("gifs", "search");

        uriComponentsBuilder.queryParam("q", term);
        uriComponentsBuilder.queryParam("api_key", apiKey);
        uriComponentsBuilder.queryParam("offset", offset);
        uriComponentsBuilder.queryParam("limit", limit);

        if (!StringUtils.isEmpty(rating)) {
            uriComponentsBuilder.queryParam("rating", rating);
        }
        if (!StringUtils.isEmpty(lang)) {
            uriComponentsBuilder.queryParam("lang", lang);
        }

        return execute(uriComponentsBuilder);
    }

    /**
     * Loads a selection of Giphy images based on the provided set of Giphy image IDs.
     *
     * @param ids A set of Giphy image IDs to load, formatted as a comma-separated string.
     * @return The unmodified API response (JSON in string form).
     * @throws InterruptedException When the API request has been interrupted.
     * @throws HttpStatusException  When the API returns an unsuccessful HTTP status.
     * @throws IOException          When an underlying IO error occurs.
     */
    public String getByIds(String ids) throws InterruptedException, HttpStatusException, IOException {
        UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromUri(baseUri);
        uriComponentsBuilder.pathSegment("gifs");
        uriComponentsBuilder.queryParam("api_key", apiKey);
        uriComponentsBuilder.queryParam("ids", ids);
        return execute(uriComponentsBuilder);
    }

    /**
     * Returns the top trending Giphy images.
     *
     * @param limit  The maximum number of results to return.
     * @param rating The rating to limit the result set to (e.g, "G", "PG", etc).
     * @return The unmodified API response (JSON in string form).
     * @throws InterruptedException When the API request has been interrupted.
     * @throws HttpStatusException  When the API returns an unsuccessful HTTP status.
     * @throws IOException          When an underlying IO error occurs.
     */
    public String trending(int limit, String rating) throws InterruptedException, HttpStatusException, IOException {
        UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromUri(baseUri);
        uriComponentsBuilder.pathSegment("gifs", "trending");
        uriComponentsBuilder.queryParam("api_key", apiKey);
        if (!StringUtils.isEmpty(rating)) {
            uriComponentsBuilder.queryParam("rating", rating);
        }
        if (!StringUtils.isEmpty(limit)) {
            uriComponentsBuilder.queryParam("limit", limit);
        }
        return execute(uriComponentsBuilder);
    }

    /**
     * Performs the actual HTTP request.
     *
     * @param uriComponentsBuilder URI builder that contains the request URI and query parameters.
     * @return The unmodified API response (JSON in string form).
     * @throws InterruptedException When the API request has been interrupted.
     * @throws HttpStatusException  When the API returns an unsuccessful HTTP status.
     * @throws IOException          When an underlying IO error occurs.
     */
    private String execute(UriComponentsBuilder uriComponentsBuilder) throws HttpStatusException, IOException, InterruptedException {
        URI uri = uriComponentsBuilder.build().toUri();

        HttpRequest request = HttpRequest.newBuilder().uri(uri).GET().build();

        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new HttpStatusException("unexpected Giphy response received", response.statusCode(), response);
        }
        return response.body();
    }

    /**
     * An exception useful for HTTP responses containing an HTTP status result that is
     * not considered successful.
     */
    public static class HttpStatusException extends Exception {
        /**
         * The HTTP status of the response.
         */
        private final int status;

        /**
         * The response instance of the request that generated a non-successful status code.
         */
        private final HttpResponse<?> response;

        /**
         * Constructor.
         *
         * @param status   HTTP status of the response.
         * @param response Response instance.
         */
        HttpStatusException(int status, HttpResponse<?> response) {
            this("an unsuccessful HTTP response (" + status + ") was received", status, response);
        }

        /**
         * Constructor.
         *
         * @param message  Message to include with the exception.
         * @param status   HTTP status of the response.
         * @param response Response instance.
         */
        HttpStatusException(String message, int status, HttpResponse<?> response) {
            super(message);
            this.status = status;
            this.response = response;
        }

        /**
         * Returns the HTTP status of the response.
         *
         * @return The HTTP status of the response.
         */
        public int getStatus() {
            return status;
        }

        /**
         * Returns the response instance.
         *
         * @return The response instance.
         */
        public HttpResponse<?> getResponse() {
            return response;
        }
    }
}
