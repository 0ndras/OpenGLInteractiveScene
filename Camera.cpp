#include "Camera.hpp"
#include <glm/gtc/matrix_transform.hpp>

namespace gps {

    // Camera constructor
    Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp)
        : cameraPosition(cameraPosition), cameraTarget(cameraTarget)
    {
        // Calculate initial directions
        cameraFrontDirection = glm::normalize(cameraTarget - cameraPosition);
        cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, cameraUp));
        cameraUpDirection = glm::cross(cameraRightDirection, cameraFrontDirection);
    }

    // Return the view matrix using glm::lookAt function
    glm::mat4 Camera::getViewMatrix() {
        return glm::lookAt(cameraPosition, cameraPosition + cameraFrontDirection, cameraUpDirection);
    }

    // Update camera position based on movement direction and speed
    void Camera::move(MOVE_DIRECTION direction, float speed) {
        if (direction == MOVE_FORWARD)
            cameraPosition += speed * cameraFrontDirection;
        if (direction == MOVE_BACKWARD)
            cameraPosition -= speed * cameraFrontDirection;
        if (direction == MOVE_RIGHT)
            cameraPosition += speed * cameraRightDirection;
        if (direction == MOVE_LEFT)
            cameraPosition -= speed * cameraRightDirection;
    }

    // Update camera orientation based on pitch and yaw
    void Camera::rotate(float pitch, float yaw) {
        // Calculate the new front direction vector based on pitch and yaw
        glm::vec3 front;
        front.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        front.y = sin(glm::radians(pitch));
        front.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
        cameraFrontDirection = glm::normalize(front);

        // Recalculate the right and up directions
        cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, glm::vec3(0.0f, 1.0f, 0.0f)));
        cameraUpDirection = glm::cross(cameraRightDirection, cameraFrontDirection);
    }
}
