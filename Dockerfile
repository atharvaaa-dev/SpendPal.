FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY . .
RUN chmod +x mvnw && ./mvnw -DskipTests package
EXPOSE 8080
CMD ["java", "-jar", "target/spendpal-0.0.1-SNAPSHOT.jar"]