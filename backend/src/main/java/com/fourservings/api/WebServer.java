// Copyright (C) 2022 Michael Van Noord
// 
// This file is part of Fourservings.
// 
// Fourservings is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Fourservings is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Fourservings.  If not, see <http://www.gnu.org/licenses/>.

package com.fourservings.api;

import java.io.File;
import java.util.Set;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

import com.fourservings.api.config.Configuration;
import com.google.inject.Module;

import org.apache.commons.lang3.StringUtils;
import org.jboss.resteasy.plugins.guice.GuiceResteasyBootstrapServletContextListener;
import org.jboss.resteasy.plugins.interceptors.CorsFilter;
import org.jboss.resteasy.plugins.server.undertow.UndertowJaxrsServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.undertow.Handlers;
import io.undertow.Undertow;
import io.undertow.predicate.Predicates;
import io.undertow.server.handlers.resource.FileResourceManager;
import io.undertow.servlet.api.DeploymentInfo;
import io.undertow.servlet.api.ListenerInfo;

/**
 * Run the guice-enabled, resteasy compatible web server
 */
public class WebServer {
    private static final Logger LOGGER = LoggerFactory.getLogger(Bootstrap.class);

    private final int port;
    private final String bindAddress;
    private final Class<? extends Module> moduleClass;

    private final String apiPath;
    private final String staticContentDir;

    /**
     * @param bindAddress The address to bind to
     * @param port        The port to bind to
     * @param moduleClass The Module class used when setting up the guice
     *                    configuration
     */
    public WebServer(
            String bindAddress, int port, 
            Class<? extends Module> moduleClass,
            String apiPath, String staticContentDirectory) {
        this.port = port;
        this.bindAddress = bindAddress;
        this.moduleClass = moduleClass;
        this.apiPath = StringUtils.isBlank(apiPath) ? "/" : apiPath;
        this.staticContentDir = staticContentDirectory;

        if (StringUtils.isNotBlank(this.staticContentDir) && this.apiPath.equals("/")) {
            throw new IllegalArgumentException("When serving static content, you must have an api path that is not '/'");
        }
    }

    public void run() {
        LOGGER.info("Starting web server on {}:{}", this.bindAddress, this.port);

        UndertowJaxrsServer server = StringUtils.isBlank(this.staticContentDir) ?
            new UndertowJaxrsServer() :
            new RewritingStaticUndertowServer();

        server.deploy(
                server.undertowDeployment(ApiApplication.class)
                        .setDeploymentName("api")
                        .setContextPath(this.apiPath)
                        .addListener(new ListenerInfo(GuiceResteasyBootstrapServletContextListener.class))
                        .addInitParameter("resteasy.guice.modules", this.moduleClass.getName()));

        server
                .setPort(this.port)
                .setHostname(this.bindAddress)
                .start();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            server.stop();
        }));
    }

    @ApplicationPath("/")
    public static class ApiApplication extends Application {
        private Set<Object> singletons;

        public ApiApplication() {
            CorsFilter cors = new CorsFilter();
            cors.getAllowedOrigins().add(Configuration.get("CORS_ORIGIN"));
            cors.setAllowedMethods("OPTIONS, GET, POST, DELETE, PUT");
            cors.setAllowCredentials(true);
            cors.setExposedHeaders("X-Auth");
            this.singletons = Set.of(cors);
        }

        @Override
        public Set<Object> getSingletons() {
            return this.singletons;
        }
    }

    /** A static-content, rewriting server useful for all-in-one deployment of
     * JAX-RS backend API and frontend SPA.
     * 
     * <li> backend api requests pass through
     * <li> /index.html, /main.js, /main.js.map all pass through
     * <li> everything else gets rewritten to "/index.html"
     */
    private class RewritingStaticUndertowServer extends UndertowJaxrsServer {
        public RewritingStaticUndertowServer() {
            super();

            this.deploy(new DeploymentInfo()
                .setDeploymentName("static")
                .setContextPath("/")
                .setResourceManager(new FileResourceManager(new File(staticContentDir)))
                .setClassLoader(this.getClass().getClassLoader())
                .addWelcomePage("index.html"));
        }

        @Override
        public UndertowJaxrsServer start() {
            server = Undertow.builder()
                    .addHttpListener(port, bindAddress)
                    .setHandler(
                        Handlers.predicate(Predicates.prefix(apiPath + "/"), root, 
                            Handlers.predicate(Predicates.paths("/index.html", "/main.js", "/main.js.map"), root, 
                                Handlers.rewrite("path-prefix('/')", "/index.html", getClass().getClassLoader(), root))
                            )
                        )
                    .build();
            server.start();
            return this;
        }
    }
}
